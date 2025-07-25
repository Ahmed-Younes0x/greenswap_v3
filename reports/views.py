from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from .models import Report, ReportAction
from .serializers import ReportSerializer, ReportCreateSerializer, ReportActionSerializer
from dashboard.permissions import IsAdminUser

class ReportListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReportCreateSerializer
        return ReportSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # المديرون يرون جميع البلاغات
            queryset = Report.objects.all()
        else:
            # المستخدمون العاديون يرون بلاغاتهم فقط
            queryset = Report.objects.filter(reporter=user)
        
        # فلترة حسب النوع
        report_type = self.request.query_params.get('type')
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        
        # فلترة حسب الحالة
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # فلترة حسب الأولوية
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class ReportDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Report.objects.all()
        return Report.objects.filter(reporter=user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def review_report(request, report_id):
    """مراجعة البلاغ من قبل الإدارة"""
    report = get_object_or_404(Report, id=report_id)
    
    action = request.data.get('action')  # 'review', 'resolve', 'reject'
    response = request.data.get('response', '')
    
    if action == 'review':
        report.mark_as_reviewed(request.user, response)
        message = 'تم تحديد البلاغ كتحت المراجعة'
    elif action == 'resolve':
        report.resolve(request.user, response)
        message = 'تم حل البلاغ'
    elif action == 'reject':
        report.reject(request.user, response)
        message = 'تم رفض البلاغ'
    else:
        return Response({'error': 'إجراء غير صحيح'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'message': message,
        'report': ReportSerializer(report, context={'request': request}).data
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def take_action_on_report(request, report_id):
    """اتخاذ إجراء على البلاغ"""
    report = get_object_or_404(Report, id=report_id)
    
    action_type = request.data.get('action_type')
    description = request.data.get('description', '')
    
    if not action_type:
        return Response({'error': 'نوع الإجراء مطلوب'}, status=status.HTTP_400_BAD_REQUEST)
    
    # إنشاء الإجراء
    action = ReportAction.objects.create(
        report=report,
        action_type=action_type,
        description=description,
        taken_by=request.user
    )
    
    # تحديث حالة البلاغ إلى محلول
    if action_type != 'no_action':
        report.resolve(request.user, f'تم اتخاذ الإجراء: {action.get_action_type_display()}')
    
    return Response({
        'message': 'تم اتخاذ الإجراء بنجاح',
        'action': ReportActionSerializer(action, context={'request': request}).data
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def reports_stats(request):
    """إحصائيات البلاغات"""
    total_reports = Report.objects.count()
    pending_reports = Report.objects.filter(status='pending').count()
    resolved_reports = Report.objects.filter(status='resolved').count()
    
    # إحصائيات حسب النوع
    reports_by_type = dict(
        Report.objects.values('report_type')
        .annotate(count=Count('id'))
        .values_list('report_type', 'count')
    )
    
    # إحصائيات حسب الأولوية
    reports_by_priority = dict(
        Report.objects.values('priority')
        .annotate(count=Count('id'))
        .values_list('priority', 'count')
    )
    
    # البلاغات الحديثة (آخر 24 ساعة)
    recent_reports = Report.objects.filter(
        created_at__gte=timezone.now() - timezone.timedelta(hours=24)
    ).count()
    
    return Response({
        'total_reports': total_reports,
        'pending_reports': pending_reports,
        'resolved_reports': resolved_reports,
        'reports_by_type': reports_by_type,
        'reports_by_priority': reports_by_priority,
        'recent_reports': recent_reports
    })