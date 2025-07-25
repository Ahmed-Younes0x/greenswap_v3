from django.contrib import admin
from .models import DashboardStats, SystemLog, AdminActivity

@admin.register(DashboardStats)
class DashboardStatsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_users', 'total_items', 'total_orders', 'total_revenue', 'created_at']
    list_filter = ['date', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-date']
    
    fieldsets = (
        ('التاريخ', {
            'fields': ('date',)
        }),
        ('إحصائيات المستخدمين', {
            'fields': ('total_users', 'new_users_today', 'active_users_today', 'verified_users')
        }),
        ('إحصائيات المنتجات', {
            'fields': ('total_items', 'new_items_today', 'available_items', 'sold_items')
        }),
        ('إحصائيات الطلبات', {
            'fields': ('total_orders', 'new_orders_today', 'completed_orders', 'pending_orders')
        }),
        ('الإحصائيات المالية', {
            'fields': ('total_revenue', 'revenue_today', 'average_order_value')
        }),
        ('إحصائيات المحادثات', {
            'fields': ('total_conversations', 'new_conversations_today', 'total_messages')
        }),
        ('إحصائيات الذكاء الاصطناعي', {
            'fields': ('ai_analyses_today', 'ai_success_rate')
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['generate_stats_for_today']
    
    def generate_stats_for_today(self, request, queryset):
        """توليد إحصائيات اليوم"""
        stats = DashboardStats.generate_today_stats()
        self.message_user(request, f'تم توليد إحصائيات {stats.date} بنجاح')
    
    generate_stats_for_today.short_description = 'توليد إحصائيات اليوم'

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ['level', 'message_preview', 'module', 'user', 'created_at']
    list_filter = ['level', 'module', 'created_at']
    search_fields = ['message', 'module', 'user__full_name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('level', 'message', 'module', 'user')
        }),
        ('معلومات الطلب', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('بيانات إضافية', {
            'fields': ('extra_data',),
            'classes': ('collapse',)
        }),
        ('التاريخ', {
            'fields': ('created_at',)
        })
    )
    
    def message_preview(self, obj):
        return obj.message[:100] + '...' if len(obj.message) > 100 else obj.message
    message_preview.short_description = 'معاينة الرسالة'

@admin.register(AdminActivity)
class AdminActivityAdmin(admin.ModelAdmin):
    list_display = ['admin_user', 'action_type', 'content_type', 'description_preview', 'created_at']
    list_filter = ['action_type', 'content_type', 'created_at']
    search_fields = ['admin_user__full_name', 'description', 'content_type']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('admin_user', 'action_type', 'content_type', 'object_id', 'description')
        }),
        ('معلومات الطلب', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('التاريخ', {
            'fields': ('created_at',)
        })
    )
    
    def description_preview(self, obj):
        return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
    description_preview.short_description = 'معاينة الوصف'