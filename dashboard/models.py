from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg
from datetime import timedelta

User = get_user_model()

class DashboardStats(models.Model):
    """إحصائيات لوحة التحكم"""
    date = models.DateField(_('التاريخ'), default=timezone.now)
    
    # إحصائيات المستخدمين
    total_users = models.IntegerField(_('إجمالي المستخدمين'), default=0)
    new_users_today = models.IntegerField(_('مستخدمين جدد اليوم'), default=0)
    active_users_today = models.IntegerField(_('مستخدمين نشطين اليوم'), default=0)
    verified_users = models.IntegerField(_('مستخدمين موثقين'), default=0)
    
    # إحصائيات المنتجات
    total_items = models.IntegerField(_('إجمالي المنتجات'), default=0)
    new_items_today = models.IntegerField(_('منتجات جديدة اليوم'), default=0)
    available_items = models.IntegerField(_('منتجات متاحة'), default=0)
    sold_items = models.IntegerField(_('منتجات مباعة'), default=0)
    
    # إحصائيات الطلبات
    total_orders = models.IntegerField(_('إجمالي الطلبات'), default=0)
    new_orders_today = models.IntegerField(_('طلبات جديدة اليوم'), default=0)
    completed_orders = models.IntegerField(_('طلبات مكتملة'), default=0)
    pending_orders = models.IntegerField(_('طلبات معلقة'), default=0)
    
    # إحصائيات مالية
    total_revenue = models.DecimalField(_('إجمالي الإيرادات'), max_digits=12, decimal_places=2, default=0)
    revenue_today = models.DecimalField(_('إيرادات اليوم'), max_digits=12, decimal_places=2, default=0)
    average_order_value = models.DecimalField(_('متوسط قيمة الطلب'), max_digits=10, decimal_places=2, default=0)
    
    # إحصائيات المحادثات
    total_conversations = models.IntegerField(_('إجمالي المحادثات'), default=0)
    new_conversations_today = models.IntegerField(_('محادثات جديدة اليوم'), default=0)
    total_messages = models.IntegerField(_('إجمالي الرسائل'), default=0)
    
    # إحصائيات الذكاء الاصطناعي
    ai_analyses_today = models.IntegerField(_('تحليلات ذكية اليوم'), default=0)
    ai_success_rate = models.FloatField(_('معدل نجاح الذكاء الاصطناعي'), default=0)
    
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)

    class Meta:
        verbose_name = _('إحصائيات لوحة التحكم')
        verbose_name_plural = _('إحصائيات لوحة التحكم')
        unique_together = ['date']
        ordering = ['-date']

    def __str__(self):
        return f'إحصائيات {self.date}'

    @classmethod
    def generate_today_stats(cls):
        """توليد إحصائيات اليوم"""
        from items.models import Item
        from orders.models import Order
        from chat.models import Conversation, Message
        from ai_services.models import AIAnalysis
        
        today = timezone.now().date()
        
        # إحصائيات المستخدمين
        total_users = User.objects.count()
        new_users_today = User.objects.filter(date_joined__date=today).count()
        active_users_today = User.objects.filter(last_login__date=today).count()
        verified_users = User.objects.filter(is_verified=True).count()
        
        # إحصائيات المنتجات
        total_items = Item.objects.count()
        new_items_today = Item.objects.filter(created_at__date=today).count()
        available_items = Item.objects.filter(status='available').count()
        sold_items = Item.objects.filter(status='sold').count()
        
        # إحصائيات الطلبات
        total_orders = Order.objects.count()
        new_orders_today = Order.objects.filter(created_at__date=today).count()
        completed_orders = Order.objects.filter(status='completed').count()
        pending_orders = Order.objects.filter(status='pending').count()
        
        # إحصائيات مالية
        completed_orders_qs = Order.objects.filter(status='completed')
        total_revenue = completed_orders_qs.aggregate(total=Sum('total_price'))['total'] or 0
        revenue_today = completed_orders_qs.filter(completed_at__date=today).aggregate(total=Sum('total_price'))['total'] or 0
        average_order_value = completed_orders_qs.aggregate(avg=Avg('total_price'))['avg'] or 0
        
        # إحصائيات المحادثات
        total_conversations = Conversation.objects.count()
        new_conversations_today = Conversation.objects.filter(created_at__date=today).count()
        total_messages = Message.objects.count()
        
        # إحصائيات الذكاء الاصطناعي
        ai_analyses_today = AIAnalysis.objects.filter(created_at__date=today).count()
        ai_total = AIAnalysis.objects.count()
        ai_success = AIAnalysis.objects.filter(status='completed').count()
        ai_success_rate = (ai_success / ai_total * 100) if ai_total > 0 else 0
        
        # إنشاء أو تحديث الإحصائيات
        stats, created = cls.objects.get_or_create(
            date=today,
            defaults={
                'total_users': total_users,
                'new_users_today': new_users_today,
                'active_users_today': active_users_today,
                'verified_users': verified_users,
                'total_items': total_items,
                'new_items_today': new_items_today,
                'available_items': available_items,
                'sold_items': sold_items,
                'total_orders': total_orders,
                'new_orders_today': new_orders_today,
                'completed_orders': completed_orders,
                'pending_orders': pending_orders,
                'total_revenue': total_revenue,
                'revenue_today': revenue_today,
                'average_order_value': average_order_value,
                'total_conversations': total_conversations,
                'new_conversations_today': new_conversations_today,
                'total_messages': total_messages,
                'ai_analyses_today': ai_analyses_today,
                'ai_success_rate': ai_success_rate,
            }
        )
        
        if not created:
            # تحديث الإحصائيات الموجودة
            stats.total_users = total_users
            stats.new_users_today = new_users_today
            stats.active_users_today = active_users_today
            stats.verified_users = verified_users
            stats.total_items = total_items
            stats.new_items_today = new_items_today
            stats.available_items = available_items
            stats.sold_items = sold_items
            stats.total_orders = total_orders
            stats.new_orders_today = new_orders_today
            stats.completed_orders = completed_orders
            stats.pending_orders = pending_orders
            stats.total_revenue = total_revenue
            stats.revenue_today = revenue_today
            stats.average_order_value = average_order_value
            stats.total_conversations = total_conversations
            stats.new_conversations_today = new_conversations_today
            stats.total_messages = total_messages
            stats.ai_analyses_today = ai_analyses_today
            stats.ai_success_rate = ai_success_rate
            stats.save()
        
        return stats

class SystemLog(models.Model):
    """سجل النظام"""
    LOG_LEVELS = [
        ('DEBUG', 'تصحيح'),
        ('INFO', 'معلومات'),
        ('WARNING', 'تحذير'),
        ('ERROR', 'خطأ'),
        ('CRITICAL', 'حرج'),
    ]
    
    level = models.CharField(_('المستوى'), max_length=10, choices=LOG_LEVELS)
    message = models.TextField(_('الرسالة'))
    module = models.CharField(_('الوحدة'), max_length=100)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('المستخدم'))
    ip_address = models.GenericIPAddressField(_('عنوان IP'), null=True, blank=True)
    user_agent = models.TextField(_('معلومات المتصفح'), blank=True)
    extra_data = models.JSONField(_('بيانات إضافية'), default=dict, blank=True)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        verbose_name = _('سجل النظام')
        verbose_name_plural = _('سجلات النظام')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['level', 'created_at']),
            models.Index(fields=['module']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.level} - {self.message[:50]}'

class AdminActivity(models.Model):
    """نشاط المديرين"""
    ACTION_TYPES = [
        ('create', 'إنشاء'),
        ('update', 'تحديث'),
        ('delete', 'حذف'),
        ('login', 'تسجيل دخول'),
        ('logout', 'تسجيل خروج'),
        ('view', 'عرض'),
        ('export', 'تصدير'),
        ('import', 'استيراد'),
    ]
    
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('المدير'))
    action_type = models.CharField(_('نوع العملية'), max_length=20, choices=ACTION_TYPES)
    content_type = models.CharField(_('نوع المحتوى'), max_length=100, blank=True)
    object_id = models.CharField(_('معرف الكائن'), max_length=100, blank=True)
    description = models.TextField(_('الوصف'))
    ip_address = models.GenericIPAddressField(_('عنوان IP'))
    user_agent = models.TextField(_('معلومات المتصفح'), blank=True)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        verbose_name = _('نشاط المدير')
        verbose_name_plural = _('أنشطة المديرين')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.admin_user.full_name} - {self.get_action_type_display()}'