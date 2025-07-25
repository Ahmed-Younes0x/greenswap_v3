from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Category(models.Model):
    name_ar = models.CharField(_('الاسم بالعربية'), max_length=100)
    name_en = models.CharField(_('الاسم بالإنجليزية'), max_length=100)
    description_ar = models.TextField(_('الوصف بالعربية'), blank=True)
    description_en = models.TextField(_('الوصف بالإنجليزية'), blank=True)
    icon = models.CharField(_('الأيقونة'), max_length=50, blank=True)
    color = models.CharField(_('اللون'), max_length=7, default='#007bff')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_active = models.BooleanField(_('نشط'), default=True)
    sort_order = models.IntegerField(_('ترتيب العرض'), default=0)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        verbose_name = _('فئة')
        verbose_name_plural = _('الفئات')
        ordering = ['sort_order', 'name_ar']

    def __str__(self):
        return self.name_ar

    def get_name(self, language='ar'):
        return self.name_ar if language == 'ar' else self.name_en

    def get_description(self, language='ar'):
        return self.description_ar if language == 'ar' else self.description_en

class Item(models.Model):
    CONDITION_CHOICES = [
        ('new', 'جديد'),
        ('like_new', 'شبه جديد'),
        ('good', 'جيد'),
        ('fair', 'مقبول'),
        ('poor', 'سيء'),
    ]

    STATUS_CHOICES = [
        ('available', 'متاح'),
        ('pending', 'معلق'),
        ('sold', 'تم البيع'),
        ('expired', 'منتهي الصلاحية'),
    ]

    title = models.CharField(_('العنوان'), max_length=200)
    description = models.TextField(_('الوصف'))
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items', verbose_name=_('الفئة'))
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items', verbose_name=_('المالك'))
    
    # Pricing and Quantity
    price = models.DecimalField(_('السعر'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    quantity = models.IntegerField(_('الكمية'), default=1, validators=[MinValueValidator(1)])
    is_negotiable = models.BooleanField(_('قابل للتفاوض'), default=True)
    
    # Item Details
    condition = models.CharField(_('الحالة'), max_length=20, choices=CONDITION_CHOICES, default='good')
    weight = models.FloatField(_('الوزن (كيلو)'), null=True, blank=True, validators=[MinValueValidator(0)])
    dimensions = models.CharField(_('الأبعاد'), max_length=100, blank=True)
    material = models.CharField(_('المادة'), max_length=100, blank=True)
    
    # Location
    location = models.CharField(_('الموقع'), max_length=200)
    latitude = models.FloatField(_('خط العرض'), null=True, blank=True)
    longitude = models.FloatField(_('خط الطول'), null=True, blank=True)
    
    # Status and Visibility
    status = models.CharField(_('الحالة'), max_length=20, choices=STATUS_CHOICES, default='available')
    is_featured = models.BooleanField(_('مميز'), default=False)
    is_urgent = models.BooleanField(_('عاجل'), default=False)
    
    # AI Analysis
    ai_analyzed = models.BooleanField(_('تم تحليله بالذكاء الاصطناعي'), default=False)
    ai_category_suggestion = models.CharField(_('اقتراح الفئة بالذكاء الاصطناعي'), max_length=100, blank=True)
    ai_condition_assessment = models.CharField(_('تقييم الحالة بالذكاء الاصطناعي'), max_length=20, blank=True)
    ai_price_suggestion = models.DecimalField(_('اقتراح السعر بالذكاء الاصطناعي'), max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    expires_at = models.DateTimeField(_('تاريخ الانتهاء'), null=True, blank=True)
    
    # Statistics
    views_count = models.IntegerField(_('عدد المشاهدات'), default=0)
    likes_count = models.IntegerField(_('عدد الإعجابات'), default=0)
    rating_average = models.FloatField(_('متوسط التقييم'), default=0.0)
    rating_count = models.IntegerField(_('عدد التقييمات'), default=0)

    class Meta:
        verbose_name = _('منتج')
        verbose_name_plural = _('المنتجات')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'category']),
            models.Index(fields=['created_at']),
            models.Index(fields=['price']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Set expiration date if not set
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=30)
        
        super().save(*args, **kwargs)

    def is_expired(self):
        return self.expires_at and timezone.now() > self.expires_at

    def update_rating(self):
        ratings = self.ratings.all()
        if ratings.exists():
            self.rating_average = ratings.aggregate(models.Avg('rating'))['rating__avg'] or 0
            self.rating_count = ratings.count()
            self.save()

class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images', verbose_name=_('المنتج'))
    image = models.ImageField(_('الصورة'), upload_to='items/')
    alt_text = models.CharField(_('النص البديل'), max_length=200, blank=True)
    is_primary = models.BooleanField(_('الصورة الرئيسية'), default=False)
    sort_order = models.IntegerField(_('ترتيب العرض'), default=0)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        verbose_name = _('صورة المنتج')
        verbose_name_plural = _('صور المنتجات')
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f'صورة {self.item.title}'

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Remove primary status from other images
            ItemImage.objects.filter(item=self.item, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

class ItemRating(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='ratings', verbose_name=_('المنتج'))
    rater = models.ForeignKey(User, on_delete=models.CASCADE, related_name='item_ratings', verbose_name=_('المقيم'))
    rating = models.IntegerField(_('التقييم'), choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(_('التعليق'), blank=True)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        unique_together = ['item', 'rater']
        verbose_name = _('تقييم المنتج')
        verbose_name_plural = _('تقييمات المنتجات')

    def __str__(self):
        return f'{self.rater} rated {self.item.title} - {self.rating} stars'

class ItemLike(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='likes', verbose_name=_('المنتج'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_items', verbose_name=_('المستخدم'))
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        unique_together = ['item', 'user']
        verbose_name = _('إعجاب بالمنتج')
        verbose_name_plural = _('إعجابات المنتجات')

    def __str__(self):
        return f'{self.user} likes {self.item.title}'

class ItemView(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='views', verbose_name=_('المنتج'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('المستخدم'))
    ip_address = models.GenericIPAddressField(_('عنوان IP'), null=True, blank=True)
    user_agent = models.TextField(_('معلومات المتصفح'), blank=True)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        verbose_name = _('مشاهدة المنتج')
        verbose_name_plural = _('مشاهدات المنتجات')

    def __str__(self):
        return f'View of {self.item.title} at {self.created_at}'