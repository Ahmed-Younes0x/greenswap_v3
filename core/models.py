from django.db import models
from django.utils.translation import gettext_lazy as _

class BaseModel(models.Model):
    """نموذج أساسي لجميع النماذج"""
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)

    class Meta:
        abstract = True

class SoftDeleteModel(BaseModel):
    """نموذج للحذف المنطقي"""
    is_deleted = models.BooleanField(_('محذوف'), default=False)
    deleted_at = models.DateTimeField(_('تاريخ الحذف'), null=True, blank=True)

    class Meta:
        abstract = True

    def soft_delete(self):
        """حذف منطقي"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """استعادة من الحذف المنطقي"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()

class SystemSettings(models.Model):
    """إعدادات النظام"""
    key = models.CharField(_('المفتاح'), max_length=100, unique=True)
    value = models.TextField(_('القيمة'))
    description = models.TextField(_('الوصف'), blank=True)
    is_active = models.BooleanField(_('نشط'), default=True)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)

    class Meta:
        verbose_name = _('إعداد النظام')
        verbose_name_plural = _('إعدادات النظام')

    def __str__(self):
        return self.key

    @classmethod
    def get_setting(cls, key, default=None):
        """الحصول على إعداد"""
        try:
            setting = cls.objects.get(key=key, is_active=True)
            return setting.value
        except cls.DoesNotExist:
            return default

    @classmethod
    def set_setting(cls, key, value, description=''):
        """تعيين إعداد"""
        setting, created = cls.objects.get_or_create(
            key=key,
            defaults={'value': value, 'description': description}
        )
        if not created:
            setting.value = value
            setting.description = description
            setting.save()
        return setting