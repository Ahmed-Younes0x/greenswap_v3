from rest_framework import serializers
from .models import Notification, NotificationSettings, NotificationTemplate
from accounts.serializers import UserPublicSerializer

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)
    time_ago = serializers.SerializerMethodField()
    can_mark_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'notification_type', 'title', 'message', 'priority',
                 'action_url', 'is_read', 'created_at', 'read_at', 'expires_at',
                 'time_ago', 'can_mark_read']
        read_only_fields = ['id', 'created_at', 'read_at']

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return 'الآن'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'منذ {minutes} دقيقة'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'منذ {hours} ساعة'
        elif diff < timedelta(days=7):
            days = diff.days
            return f'منذ {days} يوم'
        else:
            return obj.created_at.strftime('%Y-%m-%d')

    def get_can_mark_read(self, obj):
        return not obj.is_read

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = ['email_new_message', 'email_new_order', 'email_order_updates',
                 'email_item_interactions', 'email_system_notifications', 'email_promotions',
                 'push_new_message', 'push_new_order', 'push_order_updates',
                 'push_item_interactions', 'push_system_notifications', 'push_promotions',
                 'sms_new_order', 'sms_order_updates', 'sms_system_notifications',
                 'quiet_hours_start', 'quiet_hours_end']

class NotificationStatsSerializer(serializers.Serializer):
    total_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    read_notifications = serializers.IntegerField()
    notifications_by_type = serializers.DictField()
    recent_notifications_count = serializers.IntegerField()