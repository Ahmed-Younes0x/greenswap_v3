from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_message', 'رسالة جديدة'),
        ('new_order', 'طلب جديد'),
        ('order_accepted', 'تم قبول الطلب'),
        ('order_rejected', 'تم رفض الطلب'),
        ('order_completed', 'تم إكمال الطلب'),
        ('order_cancelled', 'تم إلغاء الطلب'),
        ('item_liked', 'إعجاب بالمنتج'),
        ('item_rated', 'تقييم المنتج'),
        ('user_rated', 'تقييم المستخدم'),
        ('item_expired', 'انتهاء صلاحية المنتج'),
        ('system', 'إشعار نظام'),
        ('promotion', 'عرض ترويجي'),
    ]

    PRIORITY_LEVELS = [
        ('low', 'منخفض'),
        ('normal', 'عادي'),
        ('high', 'عالي'),
        ('urgent', 'عاجل'),
    ]

    # Basic Information
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name=_('المستلم'))
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='sent_notifications', verbose_name=_('المرسل'))
    
    # Notification Details
    notification_type = models.CharField(_('نوع الإشعار'), max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(_('العنوان'), max_length=200)
    message = models.TextField(_('الرسالة'))
    priority = models.CharField(_('الأولوية'), max_length=10, choices=PRIORITY_LEVELS, default='normal')
    
    # Related Object (Generic Foreign Key)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Action URL
    action_url = models.URLField(_('رابط الإجراء'), blank=True)
    
    # Status
    is_read = models.BooleanField(_('مقروء'), default=False)
    is_sent = models.BooleanField(_('تم الإرسال'), default=False)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    read_at = models.DateTimeField(_('تاريخ القراءة'), null=True, blank=True)
    sent_at = models.DateTimeField(_('تاريخ الإرسال'), null=True, blank=True)
    
    # Expiration
    expires_at = models.DateTimeField(_('تاريخ الانتهاء'), null=True, blank=True)

    class Meta:
        verbose_name = _('إشعار')
        verbose_name_plural = _('الإشعارات')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['notification_type']),
        ]

    def __str__(self):
        return f'{self.title} - {self.recipient.full_name}'

    def mark_as_read(self):
        """تحديد الإشعار كمقروء"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

    def is_expired(self):
        """التحقق من انتهاء صلاحية الإشعار"""
        return self.expires_at and timezone.now() > self.expires_at

class NotificationSettings(models.Model):
    """إعدادات الإشعارات للمستخدم"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings', verbose_name=_('المستخدم'))
    
    # Email Notifications
    email_new_message = models.BooleanField(_('رسالة جديدة - بريد إلكتروني'), default=True)
    email_new_order = models.BooleanField(_('طلب جديد - بريد إلكتروني'), default=True)
    email_order_updates = models.BooleanField(_('تحديثات الطلب - بريد إلكتروني'), default=True)
    email_item_interactions = models.BooleanField(_('تفاعلات المنتج - بريد إلكتروني'), default=False)
    email_system_notifications = models.BooleanField(_('إشعارات النظام - بريد إلكتروني'), default=True)
    email_promotions = models.BooleanField(_('العروض الترويجية - بريد إلكتروني'), default=False)
    
    # Push Notifications
    push_new_message = models.BooleanField(_('رسالة جديدة - إشعار فوري'), default=True)
    push_new_order = models.BooleanField(_('طلب جديد - إشعار فوري'), default=True)
    push_order_updates = models.BooleanField(_('تحديثات الطلب - إشعار فوري'), default=True)
    push_item_interactions = models.BooleanField(_('تفاعلات المنتج - إشعار فوري'), default=True)
    push_system_notifications = models.BooleanField(_('إشعارات النظام - إشعار فوري'), default=True)
    push_promotions = models.BooleanField(_('العروض الترويجية - إشعار فوري'), default=False)
    
    # SMS Notifications
    sms_new_order = models.BooleanField(_('طلب جديد - رسالة نصية'), default=False)
    sms_order_updates = models.BooleanField(_('تحديثات الطلب - رسالة نصية'), default=False)
    sms_system_notifications = models.BooleanField(_('إشعارات النظام - رسالة نصية'), default=False)
    
    # General Settings
    quiet_hours_start = models.TimeField(_('بداية الساعات الهادئة'), null=True, blank=True)
    quiet_hours_end = models.TimeField(_('نهاية الساعات الهادئة'), null=True, blank=True)
    
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)

    class Meta:
        verbose_name = _('إعدادات الإشعارات')
        verbose_name_plural = _('إعدادات الإشعارات')

    def __str__(self):
        return f'إعدادات إشعارات {self.user.full_name}'

class NotificationTemplate(models.Model):
    """قوالب الإشعارات"""
    notification_type = models.CharField(_('نوع الإشعار'), max_length=20, choices=Notification.NOTIFICATION_TYPES, unique=True)
    
    # Templates for different languages
    title_ar = models.CharField(_('العنوان بالعربية'), max_length=200)
    title_en = models.CharField(_('العنوان بالإنجليزية'), max_length=200)
    message_ar = models.TextField(_('الرسالة بالعربية'))
    message_en = models.TextField(_('الرسالة بالإنجليزية'))
    
    # Email template
    email_subject_ar = models.CharField(_('موضوع البريد الإلكتروني بالعربية'), max_length=200, blank=True)
    email_subject_en = models.CharField(_('موضوع البريد الإلكتروني بالإنجليزية'), max_length=200, blank=True)
    email_body_ar = models.TextField(_('محتوى البريد الإلكتروني بالعربية'), blank=True)
    email_body_en = models.TextField(_('محتوى البريد الإلكتروني بالإنجليزية'), blank=True)
    
    # SMS template
    sms_message_ar = models.CharField(_('رسالة SMS بالعربية'), max_length=160, blank=True)
    sms_message_en = models.CharField(_('رسالة SMS بالإنجليزية'), max_length=160, blank=True)
    
    # Settings
    is_active = models.BooleanField(_('نشط'), default=True)
    priority = models.CharField(_('الأولوية الافتراضية'), max_length=10, choices=Notification.PRIORITY_LEVELS, default='normal')
    
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)

    class Meta:
        verbose_name = _('قالب الإشعار')
        verbose_name_plural = _('قوالب الإشعارات')

    def __str__(self):
        return f'قالب {self.get_notification_type_display()}'

    def get_title(self, language='ar'):
        return self.title_ar if language == 'ar' else self.title_en

    def get_message(self, language='ar'):
        return self.message_ar if language == 'ar' else self.message_en

    def get_email_subject(self, language='ar'):
        return self.email_subject_ar if language == 'ar' else self.email_subject_en

    def get_email_body(self, language='ar'):
        return self.email_body_ar if language == 'ar' else self.email_body_en

    def get_sms_message(self, language='ar'):
        return self.sms_message_ar if language == 'ar' else self.sms_message_en