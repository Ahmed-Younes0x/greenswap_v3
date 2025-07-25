from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

User = get_user_model()

class Report(models.Model):
    REPORT_TYPES = [
        ('inappropriate_item', 'منتج غير مناسب'),
        ('fake_item', 'منتج وهمي'),
        ('abusive_user', 'مستخدم مسيء'),
        ('spam', 'رسائل مزعجة'),
        ('fraud', 'احتيال'),
        ('inappropriate_content', 'محتوى غير مناسب'),
        ('copyright', 'انتهاك حقوق الطبع'),
        ('other', 'أخرى'),
    ]

    STATUS_CHOICES = [
        ('pending', 'قيد المراجعة'),
        ('under_review', 'تحت المراجعة'),
        ('resolved', 'تم الحل'),
        ('rejected', 'مرفوض'),
        ('escalated', 'تم التصعيد'),
    ]

    PRIORITY_LEVELS = [
        ('low', 'منخفض'),
        ('medium', 'متوسط'),
        ('high', 'عالي'),
        ('urgent', 'عاجل'),
    ]

    # Basic Information
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made', verbose_name=_('المبلغ'))
    report_type = models.CharField(_('نوع البلاغ'), max_length=30, choices=REPORT_TYPES)
    title = models.CharField(_('عنوان البلاغ'), max_length=200)
    description = models.TextField(_('وصف البلاغ'))
    
    # Related Object (Generic Foreign Key)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    reported_object = GenericForeignKey('content_type', 'object_id')
    
    # Status and Priority
    status = models.CharField(_('الحالة'), max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(_('الأولوية'), max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    # Evidence
    evidence_image = models.ImageField(_('صورة الدليل'), upload_to='reports/evidence/', null=True, blank=True)
    evidence_file = models.FileField(_('ملف الدليل'), upload_to='reports/files/', null=True, blank=True)
    
    # Admin Response
    admin_response = models.TextField(_('رد الإدارة'), blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_reviewed', verbose_name=_('تمت المراجعة بواسطة'))
    
    # Timestamps
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    reviewed_at = models.DateTimeField(_('تاريخ المراجعة'), null=True, blank=True)
    resolved_at = models.DateTimeField(_('تاريخ الحل'), null=True, blank=True)

    class Meta:
        verbose_name = _('بلاغ')
        verbose_name_plural = _('البلاغات')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['report_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.title} - {self.reporter.full_name}'

    def mark_as_reviewed(self, admin_user, response=''):
        """تحديد البلاغ كتمت مراجعته"""
        self.status = 'under_review'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        if response:
            self.admin_response = response
        self.save()

    def resolve(self, admin_user, response=''):
        """حل البلاغ"""
        self.status = 'resolved'
        self.reviewed_by = admin_user
        self.resolved_at = timezone.now()
        if response:
            self.admin_response = response
        self.save()

    def reject(self, admin_user, response=''):
        """رفض البلاغ"""
        self.status = 'rejected'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        if response:
            self.admin_response = response
        self.save()

class ReportAction(models.Model):
    """إجراءات تم اتخاذها على البلاغات"""
    ACTION_TYPES = [
        ('warning_sent', 'تم إرسال تحذير'),
        ('content_removed', 'تم حذف المحتوى'),
        ('user_suspended', 'تم إيقاف المستخدم'),
        ('user_banned', 'تم حظر المستخدم'),
        ('item_hidden', 'تم إخفاء المنتج'),
        ('no_action', 'لا يوجد إجراء'),
    ]

    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='actions', verbose_name=_('البلاغ'))
    action_type = models.CharField(_('نوع الإجراء'), max_length=20, choices=ACTION_TYPES)
    description = models.TextField(_('وصف الإجراء'))
    taken_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('تم الإجراء بواسطة'))
    created_at = models.DateTimeField(_('تاريخ الإجراء'), auto_now_add=True)

    class Meta:
        verbose_name = _('إجراء البلاغ')
        verbose_name_plural = _('إجراءات البلاغات')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_action_type_display()} - {self.report.title}'