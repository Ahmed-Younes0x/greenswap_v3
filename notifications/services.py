from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from .models import Notification, NotificationSettings, NotificationTemplate

User = get_user_model()

class NotificationService:
    """خدمة إدارة الإشعارات"""
    
    @staticmethod
    def create_notification(recipient, notification_type, title=None, message=None, 
                          sender=None, content_object=None, action_url='', 
                          priority='normal', expires_at=None):
        """إنشاء إشعار جديد"""
        
        # الحصول على القالب إذا لم يتم تمرير العنوان والرسالة
        if not title or not message:
            template = NotificationTemplate.objects.filter(
                notification_type=notification_type,
                is_active=True
            ).first()
            
            if template:
                # تحديد اللغة حسب إعدادات المستخدم
                language = getattr(recipient, 'preferred_language', 'ar')
                title = title or template.get_title(language)
                message = message or template.get_message(language)
                priority = priority or template.priority
        
        # إنشاء الإشعار
        notification = Notification.objects.create(
            recipient=recipient,
            sender=sender,
            notification_type=notification_type,
            title=title or 'إشعار جديد',
            message=message or 'لديك إشعار جديد',
            priority=priority,
            action_url=action_url,
            expires_at=expires_at,
            content_object=content_object
        )
        
        # إرسال الإشعار عبر القنوات المختلفة
        NotificationService.send_notification(notification)
        
        return notification
    
    @staticmethod
    def send_notification(notification):
        """إرسال الإشعار عبر القنوات المختلفة"""
        
        # الحصول على إعدادات الإشعارات للمستخدم
        settings, created = NotificationSettings.objects.get_or_create(
            user=notification.recipient
        )
        
        # إرسال إشعار فوري (WebSocket)
        if NotificationService.should_send_push_notification(notification, settings):
            NotificationService.send_push_notification(notification)
        
        # إرسال بريد إلكتروني
        if NotificationService.should_send_email_notification(notification, settings):
            NotificationService.send_email_notification(notification)
        
        # إرسال رسالة نصية
        if NotificationService.should_send_sms_notification(notification, settings):
            NotificationService.send_sms_notification(notification)
        
        # تحديث حالة الإرسال
        notification.is_sent = True
        notification.sent_at = timezone.now()
        notification.save()
    
    @staticmethod
    def should_send_push_notification(notification, settings):
        """تحديد ما إذا كان يجب إرسال إشعار فوري"""
        type_mapping = {
            'new_message': settings.push_new_message,
            'new_order': settings.push_new_order,
            'order_accepted': settings.push_order_updates,
            'order_rejected': settings.push_order_updates,
            'order_completed': settings.push_order_updates,
            'order_cancelled': settings.push_order_updates,
            'item_liked': settings.push_item_interactions,
            'item_rated': settings.push_item_interactions,
            'user_rated': settings.push_item_interactions,
            'system': settings.push_system_notifications,
            'promotion': settings.push_promotions,
        }
        
        return type_mapping.get(notification.notification_type, True)
    
    @staticmethod
    def should_send_email_notification(notification, settings):
        """تحديد ما إذا كان يجب إرسال بريد إلكتروني"""
        type_mapping = {
            'new_message': settings.email_new_message,
            'new_order': settings.email_new_order,
            'order_accepted': settings.email_order_updates,
            'order_rejected': settings.email_order_updates,
            'order_completed': settings.email_order_updates,
            'order_cancelled': settings.email_order_updates,
            'item_liked': settings.email_item_interactions,
            'item_rated': settings.email_item_interactions,
            'user_rated': settings.email_item_interactions,
            'system': settings.email_system_notifications,
            'promotion': settings.email_promotions,
        }
        
        return type_mapping.get(notification.notification_type, False)
    
    @staticmethod
    def should_send_sms_notification(notification, settings):
        """تحديد ما إذا كان يجب إرسال رسالة نصية"""
        type_mapping = {
            'new_order': settings.sms_new_order,
            'order_accepted': settings.sms_order_updates,
            'order_rejected': settings.sms_order_updates,
            'order_completed': settings.sms_order_updates,
            'order_cancelled': settings.sms_order_updates,
            'system': settings.sms_system_notifications,
        }
        
        return type_mapping.get(notification.notification_type, False)
    
    @staticmethod
    def send_push_notification(notification):
        """إرسال إشعار فوري عبر WebSocket"""
        try:
            # يمكن تنفيذ WebSocket هنا
            print(f"Push notification sent to {notification.recipient.email}: {notification.title}")
        except Exception as e:
            print(f"Error sending push notification: {e}")
    
    @staticmethod
    def send_email_notification(notification):
        """إرسال إشعار عبر البريد الإلكتروني"""
        from django.core.mail import send_mail
        from django.conf import settings
        
        try:
            # الحصول على القالب
            template = NotificationTemplate.objects.filter(
                notification_type=notification.notification_type,
                is_active=True
            ).first()
            
            if template:
                language = getattr(notification.recipient, 'preferred_language', 'ar')
                subject = template.get_email_subject(language) or notification.title
                body = template.get_email_body(language) or notification.message
            else:
                subject = notification.title
                body = notification.message
            
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[notification.recipient.email],
                fail_silently=True
            )
        except Exception as e:
            print(f"Error sending email notification: {e}")
    
    @staticmethod
    def send_sms_notification(notification):
        """إرسال إشعار عبر الرسائل النصية"""
        try:
            # يمكن تنفيذ SMS هنا
            print(f"SMS notification sent to {notification.recipient.phone}: {notification.message}")
        except Exception as e:
            print(f"Error sending SMS notification: {e}")
    
    @staticmethod
    def create_order_notification(order, notification_type):
        """إنشاء إشعار خاص بالطلبات"""
        
        type_messages = {
            'new_order': {
                'title': 'طلب جديد',
                'message': f'لديك طلب جديد على المنتج: {order.item.title}',
                'recipient': order.seller
            },
            'order_accepted': {
                'title': 'تم قبول الطلب',
                'message': f'تم قبول طلبك للمنتج: {order.item.title}',
                'recipient': order.buyer
            },
            'order_rejected': {
                'title': 'تم رفض الطلب',
                'message': f'تم رفض طلبك للمنتج: {order.item.title}',
                'recipient': order.buyer
            },
            'order_completed': {
                'title': 'تم إكمال الطلب',
                'message': f'تم إكمال طلبك للمنتج: {order.item.title}',
                'recipient': order.buyer
            },
            'order_cancelled': {
                'title': 'تم إلغاء الطلب',
                'message': f'تم إلغاء الطلب للمنتج: {order.item.title}',
                'recipient': order.seller
            }
        }
        
        if notification_type in type_messages:
            info = type_messages[notification_type]
            return NotificationService.create_notification(
                recipient=info['recipient'],
                notification_type=notification_type,
                title=info['title'],
                message=info['message'],
                content_object=order,
                action_url=f'/orders/{order.id}/',
                priority='high' if notification_type == 'new_order' else 'normal'
            )