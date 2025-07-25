from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from items.models import Item

User = get_user_model()

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('accepted', 'مقبول'),
        ('rejected', 'مرفوض'),
        ('in_progress', 'قيد التنفيذ'),
        ('completed', 'مكتمل'),
        ('cancelled', 'ملغي'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('paid', 'مدفوع'),
        ('refunded', 'مسترد'),
    ]

    # Basic Information
    order_number = models.CharField(_('رقم الطلب'), max_length=20, unique=True)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_as_buyer', verbose_name=_('المشتري'))
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_as_seller', verbose_name=_('البائع'))
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='orders', verbose_name=_('المنتج'))
    
    # Order Details
    quantity = models.IntegerField(_('الكمية'), validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(_('سعر الوحدة'), max_digits=10, decimal_places=2)
    total_price = models.DecimalField(_('المبلغ الإجمالي'), max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(_('حالة الطلب'), max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(_('حالة الدفع'), max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Delivery Information
    delivery_address = models.TextField(_('عنوان التسليم'))
    delivery_phone = models.CharField(_('رقم هاتف التسليم'), max_length=15)
    delivery_notes = models.TextField(_('ملاحظات التسليم'), blank=True)
    
    # Dates
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    accepted_at = models.DateTimeField(_('تاريخ الموافقة'), null=True, blank=True)
    completed_at = models.DateTimeField(_('تاريخ الإكمال'), null=True, blank=True)
    expected_delivery_date = models.DateTimeField(_('تاريخ التسليم المتوقع'), null=True, blank=True)
    
    # Communication
    buyer_notes = models.TextField(_('ملاحظات المشتري'), blank=True)
    seller_notes = models.TextField(_('ملاحظات البائع'), blank=True)
    
    class Meta:
        verbose_name = _('طلب')
        verbose_name_plural = _('الطلبات')
        ordering = ['-created_at']

    def __str__(self):
        return f'Order {self.order_number} - {self.item.title}'

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        
        # Calculate total price
        self.total_price = self.quantity * self.unit_price
        
        super().save(*args, **kwargs)

    def generate_order_number(self):
        import random
        import string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

    def accept_order(self):
        self.status = 'accepted'
        self.accepted_at = timezone.now()
        self.save()

    def reject_order(self):
        self.status = 'rejected'
        self.save()

    def complete_order(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
        
        # Update item status if all quantity is ordered
        if self.quantity >= self.item.quantity:
            self.item.status = 'sold'
            self.item.save()
        
        # Update user statistics
        self.buyer.total_orders_made += 1
        self.buyer.save()

class OrderMessage(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='messages', verbose_name=_('الطلب'))
    sender = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('المرسل'))
    message = models.TextField(_('الرسالة'))
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    is_read = models.BooleanField(_('مقروء'), default=False)

    class Meta:
        verbose_name = _('رسالة الطلب')
        verbose_name_plural = _('رسائل الطلبات')
        ordering = ['created_at']

    def __str__(self):
        return f'Message from {self.sender.full_name} on {self.order.order_number}'

class OrderTracking(models.Model):
    STATUS_CHOICES = [
        ('order_placed', 'تم تقديم الطلب'),
        ('order_accepted', 'تم قبول الطلب'),
        ('preparing', 'جاري التحضير'),
        ('ready_for_pickup', 'جاهز للاستلام'),
        ('in_transit', 'في الطريق'),
        ('delivered', 'تم التسليم'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='tracking', verbose_name=_('الطلب'))
    status = models.CharField(_('الحالة'), max_length=20, choices=STATUS_CHOICES)
    description = models.TextField(_('الوصف'))
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('تم إنشاؤه بواسطة'))

    class Meta:
        verbose_name = _('تتبع الطلب')
        verbose_name_plural = _('تتبع الطلبات')
        ordering = ['created_at']

    def __str__(self):
        return f'Tracking {self.order.order_number} - {self.status}'

class OrderRating(models.Model):
    RATING_TYPES = [
        ('buyer_to_seller', 'من المشتري للبائع'),
        ('seller_to_buyer', 'من البائع للمشتري'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='ratings', verbose_name=_('الطلب'))
    rater = models.ForeignKey(User, on_delete=models.CASCADE, related_name='order_ratings_given', verbose_name=_('المقيم'))
    rated_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='order_ratings_received', verbose_name=_('المستخدم المقيم'))
    rating_type = models.CharField(_('نوع التقييم'), max_length=20, choices=RATING_TYPES)
    rating = models.IntegerField(_('التقييم'), choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(_('التعليق'), blank=True)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        unique_together = ['order', 'rater', 'rating_type']
        verbose_name = _('تقييم الطلب')
        verbose_name_plural = _('تقييمات الطلبات')

    def __str__(self):
        return f'Rating for order {self.order.order_number} by {self.rater.full_name}'