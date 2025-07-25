from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from notifications.services import NotificationService

@receiver(post_save, sender=Order)
def order_status_notification(sender, instance, created, **kwargs):
    """إرسال إشعارات عند تغيير حالة الطلب"""
    if created:
        # إشعار للبائع بطلب جديد
        NotificationService.create_order_notification(instance, 'new_order')
    else:
        # إشعارات تغيير الحالة
        if instance.status == 'accepted':
            NotificationService.create_order_notification(instance, 'order_accepted')
        elif instance.status == 'rejected':
            NotificationService.create_order_notification(instance, 'order_rejected')
        elif instance.status == 'completed':
            NotificationService.create_order_notification(instance, 'order_completed')
        elif instance.status == 'cancelled':
            NotificationService.create_order_notification(instance, 'order_cancelled')