from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class PaymentMethod(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('card', 'Credit/Debit Card'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_methods')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    card_last_four = models.CharField(max_length=4, blank=True, null=True)
    card_brand = models.CharField(max_length=20, blank=True, null=True)  # Visa, MasterCard, etc.
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        if self.card_last_four:
            return f"{self.card_brand} ending in {self.card_last_four}"
        return f"{self.payment_type}"


class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('order_payment', 'Order Payment'),
        ('refund', 'Refund'),
        ('partial_refund', 'Partial Refund'),
    ]
    
    # Basic payment info
    payment_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payments')
    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments_made')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments_received')
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='order_payment')
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)  # External payment processor ID
    gateway_response = models.JSONField(blank=True, null=True)  # Store gateway response data
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    failed_at = models.DateTimeField(blank=True, null=True)
    
    # Additional info
    description = models.TextField(blank=True)
    failure_reason = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.amount} {self.currency}"
    
    def mark_as_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
        
        # Update order payment status
        if self.payment_type == 'order_payment':
            self.order.payment_status = 'paid'
            self.order.payment_date = self.completed_at
            self.order.save()
    
    def mark_as_failed(self, reason=None):
        self.status = 'failed'
        self.failed_at = timezone.now()
        if reason:
            self.failure_reason = reason
        self.save()


class PaymentHistory(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='history')
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    change_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Payment histories'
    
    def __str__(self):
        return f"{self.payment.payment_id} - {self.previous_status} to {self.new_status}"


class Refund(models.Model):
    REFUND_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    refund_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    original_payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=REFUND_STATUS_CHOICES, default='pending')
    
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='refunds_requested')
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='refunds_processed')
    
    # External refund tracking
    external_refund_id = models.CharField(max_length=100, blank=True, null=True)
    gateway_response = models.JSONField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Refund {self.refund_id} - {self.refund_amount}"