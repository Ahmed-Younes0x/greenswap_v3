from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
from notifications.services import NotificationService

@receiver(post_save, sender=Message)
def new_message_notification(sender, instance, created, **kwargs):
    """إرسال إشعار عند وصول رسالة جديدة"""
    if created and instance.message_type == 'user':
        NotificationService.create_message_notification(instance)