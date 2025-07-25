from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ItemLike, ItemRating, ItemView
from notifications.services import NotificationService

@receiver(post_save, sender=ItemLike)
def item_liked_notification(sender, instance, created, **kwargs):
    """إرسال إشعار عند الإعجاب بمنتج"""
    if created:
        NotificationService.create_item_notification(
            item=instance.item,
            notification_type='item_liked',
            user=instance.user
        )

@receiver(post_save, sender=ItemRating)
def item_rated_notification(sender, instance, created, **kwargs):
    """إرسال إشعار عند تقييم منتج"""
    if created:
        NotificationService.create_item_notification(
            item=instance.item,
            notification_type='item_rated',
            user=instance.rater
        )

@receiver(post_save, sender=ItemView)
def update_item_views_count(sender, instance, created, **kwargs):
    """تحديث عداد المشاهدات"""
    if created:
        item = instance.item
        item.views_count = item.views.count()
        item.save()

@receiver(post_save, sender=ItemLike)
def update_item_likes_count(sender, instance, created, **kwargs):
    """تحديث عداد الإعجابات عند الإضافة"""
    item = instance.item
    item.likes_count = item.likes.count()
    item.save()

@receiver(post_delete, sender=ItemLike)
def update_item_likes_count_delete(sender, instance, **kwargs):
    """تحديث عداد الإعجابات عند الحذف"""
    item = instance.item
    item.likes_count = item.likes.count()
    item.save()