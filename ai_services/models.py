from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()

class AIAnalysis(models.Model):
    ANALYSIS_TYPES = [
        ('image_classification', 'تصنيف الصور'),
        ('text_analysis', 'تحليل النصوص'),
        ('price_suggestion', 'اقتراح السعر'),
        ('category_suggestion', 'اقتراح الفئة'),
        ('condition_assessment', 'تقييم الحالة'),
        ('content_moderation', 'مراجعة المحتوى'),
    ]

    STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('processing', 'قيد المعالجة'),
        ('completed', 'مكتمل'),
        ('failed', 'فشل'),
    ]

    # Basic Information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_analyses', verbose_name=_('المستخدم'))
    analysis_type = models.CharField(_('نوع التحليل'), max_length=30, choices=ANALYSIS_TYPES)
    status = models.CharField(_('الحالة'), max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Input Data
    input_text = models.TextField(_('النص المدخل'), blank=True)
    input_image = models.ImageField(_('الصورة المدخلة'), upload_to='ai/input/', null=True, blank=True)
    input_data = models.JSONField(_('بيانات إضافية'), default=dict, blank=True)
    
    # Results
    result_data = models.JSONField(_('نتائج التحليل'), default=dict, blank=True)
    confidence_score = models.FloatField(_('درجة الثقة'), null=True, blank=True)
    
    # Processing Info
    processing_time = models.FloatField(_('وقت المعالجة (ثانية)'), null=True, blank=True)
    error_message = models.TextField(_('رسالة الخطأ'), blank=True)
    
    # Related Objects
    related_item = models.ForeignKey('items.Item', on_delete=models.CASCADE, null=True, blank=True, related_name='ai_analyses', verbose_name=_('المنتج المرتبط'))
    
    # Timestamps
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    started_at = models.DateTimeField(_('تاريخ البدء'), null=True, blank=True)
    completed_at = models.DateTimeField(_('تاريخ الإكمال'), null=True, blank=True)

    class Meta:
        verbose_name = _('تحليل ذكي')
        verbose_name_plural = _('التحليلات الذكية')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_analysis_type_display()} - {self.user.full_name}'

    def start_processing(self):
        """بدء المعالجة"""
        self.status = 'processing'
        self.started_at = timezone.now()
        self.save()

    def complete_processing(self, result_data, confidence_score=None, processing_time=None):
        """إكمال المعالجة"""
        self.status = 'completed'
        self.result_data = result_data
        self.confidence_score = confidence_score
        self.processing_time = processing_time
        self.completed_at = timezone.now()
        self.save()

    def fail_processing(self, error_message):
        """فشل المعالجة"""
        self.status = 'failed'
        self.error_message = error_message
        self.completed_at = timezone.now()
        self.save()

class ChatBot(models.Model):
    """نموذج لحفظ محادثات البوت الذكي"""
    
    SESSION_TYPES = [
        ('general', 'عام'),
        ('item_help', 'مساعدة في المنتج'),
        ('recycling_guide', 'دليل إعادة التدوير'),
        ('price_inquiry', 'استفسار عن السعر'),
        ('technical_support', 'دعم فني'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatbot_sessions', verbose_name=_('المستخدم'))
    session_id = models.CharField(_('معرف الجلسة'), max_length=100, unique=True)
    session_type = models.CharField(_('نوع الجلسة'), max_length=20, choices=SESSION_TYPES, default='general')
    
    # Session Data
    context_data = models.JSONField(_('بيانات السياق'), default=dict, blank=True)
    is_active = models.BooleanField(_('نشط'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    last_activity = models.DateTimeField(_('آخر نشاط'), auto_now=True)

    class Meta:
        verbose_name = _('جلسة البوت الذكي')
        verbose_name_plural = _('جلسات البوت الذكي')
        ordering = ['-last_activity']

    def __str__(self):
        return f'جلسة {self.session_id} - {self.user.full_name}'

class ChatBotMessage(models.Model):
    MESSAGE_TYPES = [
        ('user', 'مستخدم'),
        ('bot', 'بوت'),
        ('system', 'نظام'),
    ]

    session = models.ForeignKey(ChatBot, on_delete=models.CASCADE, related_name='messages', verbose_name=_('الجلسة'))
    message_type = models.CharField(_('نوع الرسالة'), max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField(_('المحتوى'))
    
    # Metadata
    metadata = models.JSONField(_('بيانات إضافية'), default=dict, blank=True)
    processing_time = models.FloatField(_('وقت المعالجة'), null=True, blank=True)
    
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        verbose_name = _('رسالة البوت الذكي')
        verbose_name_plural = _('رسائل البوت الذكي')
        ordering = ['created_at']

    def __str__(self):
        return f'{self.get_message_type_display()}: {self.content[:50]}...'

class AIModel(models.Model):
    """نموذج لإدارة نماذج الذكاء الاصطناعي"""
    
    MODEL_TYPES = [
        ('image_classification', 'تصنيف الصور'),
        ('text_classification', 'تصنيف النصوص'),
        ('price_prediction', 'توقع الأسعار'),
        ('content_moderation', 'مراجعة المحتوى'),
        ('chatbot', 'البوت الذكي'),
    ]

    name = models.CharField(_('اسم النموذج'), max_length=100)
    model_type = models.CharField(_('نوع النموذج'), max_length=30, choices=MODEL_TYPES)
    version = models.CharField(_('الإصدار'), max_length=20)
    
    # Configuration
    config = models.JSONField(_('الإعدادات'), default=dict)
    is_active = models.BooleanField(_('نشط'), default=True)
    is_default = models.BooleanField(_('افتراضي'), default=False)
    
    # Performance Metrics
    accuracy = models.FloatField(_('الدقة'), null=True, blank=True)
    avg_processing_time = models.FloatField(_('متوسط وقت المعالجة'), null=True, blank=True)
    total_requests = models.IntegerField(_('إجمالي الطلبات'), default=0)
    successful_requests = models.IntegerField(_('الطلبات الناجحة'), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    last_used = models.DateTimeField(_('آخر استخدام'), null=True, blank=True)

    class Meta:
        verbose_name = _('نموذج ذكي')
        verbose_name_plural = _('النماذج الذكية')
        unique_together = ['model_type', 'is_default']

    def __str__(self):
        return f'{self.name} v{self.version}'

    def update_metrics(self, processing_time, success=True):
        """تحديث مقاييس الأداء"""
        self.total_requests += 1
        if success:
            self.successful_requests += 1
        
        # تحديث متوسط وقت المعالجة
        if self.avg_processing_time:
            self.avg_processing_time = (self.avg_processing_time + processing_time) / 2
        else:
            self.avg_processing_time = processing_time
        
        # تحديث الدقة
        self.accuracy = (self.successful_requests / self.total_requests) * 100
        
        self.last_used = timezone.now()
        self.save()