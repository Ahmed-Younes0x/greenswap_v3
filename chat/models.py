from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()

class Conversation(models.Model):
    CONVERSATION_TYPES = [
        ('direct', 'محادثة مباشرة'),
        ('order', 'محادثة طلب'),
        ('support', 'دعم فني'),
    ]

    participants = models.ManyToManyField(User, related_name='conversations', verbose_name=_('المشاركون'))
    conversation_type = models.CharField(_('نوع المحادثة'), max_length=20, choices=CONVERSATION_TYPES, default='direct')
    title = models.CharField(_('العنوان'), max_length=200, blank=True)
    
    # Related objects
    related_item = models.ForeignKey('items.Item', on_delete=models.CASCADE, null=True, blank=True, related_name='conversations', verbose_name=_('المنتج المرتبط'))
    related_order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, null=True, blank=True, related_name='conversations', verbose_name=_('الطلب المرتبط'))
    
    # Status
    is_active = models.BooleanField(_('نشط'), default=True)
    is_archived = models.BooleanField(_('مؤرشف'), default=False)
    
    # Timestamps
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    last_message_at = models.DateTimeField(_('آخر رسالة'), null=True, blank=True)

    class Meta:
        verbose_name = _('محادثة')
        verbose_name_plural = _('المحادثات')
        ordering = ['-last_message_at', '-updated_at']

    def __str__(self):
        if self.title:
            return self.title
        participants_names = ', '.join([p.full_name for p in self.participants.all()[:2]])
        return f'محادثة: {participants_names}'

    def get_other_participant(self, user):
        """الحصول على المشارك الآخر في المحادثة المباشرة"""
        return self.participants.exclude(id=user.id).first()

    def mark_as_read(self, user):
        """تحديد جميع الرسائل كمقروءة للمستخدم"""
        self.messages.filter(is_read=False).exclude(sender=user).update(is_read=True)

class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'نص'),
        ('image', 'صورة'),
        ('file', 'ملف'),
        ('location', 'موقع'),
        ('system', 'رسالة نظام'),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages', verbose_name=_('المحادثة'))
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', verbose_name=_('المرسل'))
    
    # Message content
    message_type = models.CharField(_('نوع الرسالة'), max_length=20, choices=MESSAGE_TYPES, default='text')
    content = models.TextField(_('المحتوى'))
    
    # Media attachments
    image = models.ImageField(_('صورة'), upload_to='chat/images/', null=True, blank=True)
    file = models.FileField(_('ملف'), upload_to='chat/files/', null=True, blank=True)
    
    # Location data
    latitude = models.FloatField(_('خط العرض'), null=True, blank=True)
    longitude = models.FloatField(_('خط الطول'), null=True, blank=True)
    
    # Message status
    is_read = models.BooleanField(_('مقروء'), default=False)
    is_edited = models.BooleanField(_('معدل'), default=False)
    is_deleted = models.BooleanField(_('محذوف'), default=False)
    
    # Reply functionality
    reply_to = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name=_('رد على'))
    
    # Timestamps
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)
    read_at = models.DateTimeField(_('تاريخ القراءة'), null=True, blank=True)

    class Meta:
        verbose_name = _('رسالة')
        verbose_name_plural = _('الرسائل')
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.full_name}: {self.content[:50]}...'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update conversation's last message time
        self.conversation.last_message_at = self.created_at
        self.conversation.save()

    def mark_as_read(self, user=None):
        """تحديد الرسالة كمقروءة"""
        if not self.is_read and (user is None or self.sender != user):
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

class MessageRead(models.Model):
    """تتبع قراءة الرسائل لكل مستخدم في المحادثات الجماعية"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_by', verbose_name=_('الرسالة'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('المستخدم'))
    read_at = models.DateTimeField(_('تاريخ القراءة'), auto_now_add=True)

    class Meta:
        unique_together = ['message', 'user']
        verbose_name = _('قراءة الرسالة')
        verbose_name_plural = _('قراءات الرسائل')

    def __str__(self):
        return f'{self.user.full_name} read message at {self.read_at}'