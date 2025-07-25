from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Notification, NotificationSettings, NotificationTemplate
from .serializers import (
    NotificationSerializer, NotificationSettingsSerializer,
    NotificationStatsSerializer
)
from .services import NotificationService

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(recipient=user)
        
        # فلترة حسب النوع
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # فلترة حسب حالة القراءة
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # فلترة حسب الأولوية
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # استبعاد الإشعارات المنتهية الصلاحية
        queryset = queryset.filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        )
        
        return queryset.order_by('-created_at')

class NotificationDetailView(generics.RetrieveAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        notification = self.get_object()
        
        # تحديد الإشعار كمقروء عند عرضه
        if not notification.is_read:
            notification.mark_as_read()
        
        return super().retrieve(request, *args, **kwargs)

class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """تحديد إشعار واحد كمقروء"""
    notification = get_object_or_404(
        Notification, 
        id=notification_id, 
        recipient=request.user
    )
    
    notification.mark_as_read()
    
    return Response({
        'message': 'تم تحديد الإشعار كمقروء',
        'notification_id': notification_id
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """تحديد جميع الإشعارات كمقروءة"""
    user = request.user
    
    unread_notifications = Notification.objects.filter(
        recipient=user,
        is_read=False
    )
    
    count = unread_notifications.count()
    unread_notifications.update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'تم تحديد {count} إشعار كمقروء',
        'marked_count': count
    })

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_notification(request, notification_id):
    """حذف إشعار"""
    notification = get_object_or_404(
        Notification, 
        id=notification_id, 
        recipient=request.user
    )
    
    notification.delete()
    
    return Response({
        'message': 'تم حذف الإشعار بنجاح'
    })

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_all_notifications(request):
    """حذف جميع الإشعارات"""
    user = request.user
    
    # حذف الإشعارات المقروءة فقط أو جميع الإشعارات حسب المعامل
    read_only = request.query_params.get('read_only', 'true').lower() == 'true'
    
    if read_only:
        notifications = Notification.objects.filter(recipient=user, is_read=True)
        message = 'تم حذف جميع الإشعارات المقروءة'
    else:
        notifications = Notification.objects.filter(recipient=user)
        message = 'تم حذف جميع الإشعارات'
    
    count = notifications.count()
    notifications.delete()
    
    return Response({
        'message': message,
        'deleted_count': count
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_stats(request):
    """إحصائيات الإشعارات"""
    user = request.user
    
    total_notifications = Notification.objects.filter(recipient=user).count()
    unread_notifications = Notification.objects.filter(recipient=user, is_read=False).count()
    read_notifications = total_notifications - unread_notifications
    
    # إحصائيات حسب النوع
    notifications_by_type = dict(
        Notification.objects.filter(recipient=user)
        .values('notification_type')
        .annotate(count=Count('id'))
        .values_list('notification_type', 'count')
    )
    
    # عدد الإشعارات الحديثة (آخر 24 ساعة)
    recent_notifications_count = Notification.objects.filter(
        recipient=user,
        created_at__gte=timezone.now() - timedelta(hours=24)
    ).count()
    
    data = {
        'total_notifications': total_notifications,
        'unread_notifications': unread_notifications,
        'read_notifications': read_notifications,
        'notifications_by_type': notifications_by_type,
        'recent_notifications_count': recent_notifications_count
    }
    
    serializer = NotificationStatsSerializer(data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_notifications_count(request):
    """عدد الإشعارات غير المقروءة"""
    user = request.user
    
    unread_count = Notification.objects.filter(
        recipient=user,
        is_read=False
    ).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
    ).count()
    
    return Response({'unread_count': unread_count})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def test_notification(request):
    """إرسال إشعار تجريبي (للتطوير فقط)"""
    user = request.user
    
    notification = NotificationService.create_notification(
        recipient=user,
        notification_type='system',
        title='إشعار تجريبي',
        message='هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح.',
        priority='normal'
    )
    
    return Response({
        'message': 'تم إرسال الإشعار التجريبي',
        'notification_id': notification.id
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_types(request):
    """قائمة أنواع الإشعارات المتاحة"""
    types = [
        {'value': choice[0], 'label': choice[1]}
        for choice in Notification.NOTIFICATION_TYPES
    ]
    
    return Response({'notification_types': types})