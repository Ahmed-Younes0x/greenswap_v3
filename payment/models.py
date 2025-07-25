from django.db import models
from django.conf import settings
from orders.models import Order

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    sender_phone = models.CharField(max_length=20)  # buyer phone number used
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reference_number = models.CharField(max_length=100, unique=True)
    is_verified = models.BooleanField(default=False)
    is_cancelled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    staff_verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"Payment for Order #{self.order.id} - Verified: {self.is_verified}"
