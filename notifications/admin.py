from django.contrib import admin
from .models import Notification, NotificationSettings, NotificationTemplate

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'sender', 'notification_type', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'is_sent', 'created_at']
    search_fields = ['title', 'message', 'recipient__full_name', 'sender__full_name']
    readonly_fields = ['created_at', 'read_at', 'sent_at']
    
    fieldsets = (
        (None, {
            'fields': ('recipient', 'sender', 'notification_type', 'title', 'message', 'priority')
        }),
        ('Content', {
            'fields': ('content_type', 'object_id', 'action_url')
        }),
        ('Status', {
            'fields': ('is_read', 'is_sent', 'expires_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'read_at', 'sent_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_new_message', 'push_new_message', 'sms_new_order']
    search_fields = ['user__full_name', 'user__email']
    
    fieldsets = (
        ('Email Notifications', {
            'fields': ('email_new_message', 'email_new_order', 'email_order_updates',
                      'email_item_interactions', 'email_system_notifications', 'email_promotions')
        }),
        ('Push Notifications', {
            'fields': ('push_new_message', 'push_new_order', 'push_order_updates',
                      'push_item_interactions', 'push_system_notifications', 'push_promotions')
        }),
        ('SMS Notifications', {
            'fields': ('sms_new_order', 'sms_order_updates', 'sms_system_notifications')
        }),
        ('General Settings', {
            'fields': ('quiet_hours_start', 'quiet_hours_end')
        })
    )

@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['notification_type', 'title_ar', 'is_active', 'priority']
    list_filter = ['notification_type', 'is_active', 'priority']
    search_fields = ['title_ar', 'title_en', 'message_ar', 'message_en']
    
    fieldsets = (
        (None, {
            'fields': ('notification_type', 'is_active', 'priority')
        }),
        ('Arabic Templates', {
            'fields': ('title_ar', 'message_ar', 'email_subject_ar', 'email_body_ar', 'sms_message_ar')
        }),
        ('English Templates', {
            'fields': ('title_en', 'message_en', 'email_subject_en', 'email_body_en', 'sms_message_en')
        })
    )