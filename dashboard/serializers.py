from rest_framework import serializers
from .models import DashboardStats, SystemLog, AdminActivity
from accounts.serializers import UserPublicSerializer

class DashboardStatsSerializer(serializers.ModelSerializer):
    growth_rate_users = serializers.SerializerMethodField()
    growth_rate_items = serializers.SerializerMethodField()
    growth_rate_orders = serializers.SerializerMethodField()
    growth_rate_revenue = serializers.SerializerMethodField()

    class Meta:
        model = DashboardStats
        fields = '__all__'

    def get_growth_rate_users(self, obj):
        """حساب معدل نمو المستخدمين"""
        try:
            from django.utils import timezone
            yesterday_stats = DashboardStats.objects.filter(
                date=obj.date - timezone.timedelta(days=1)
            ).first()
            if yesterday_stats and yesterday_stats.total_users > 0:
                return ((obj.total_users - yesterday_stats.total_users) / yesterday_stats.total_users) * 100
        except:
            pass
        return 0

    def get_growth_rate_items(self, obj):
        """حساب معدل نمو المنتجات"""
        try:
            from django.utils import timezone
            yesterday_stats = DashboardStats.objects.filter(
                date=obj.date - timezone.timedelta(days=1)
            ).first()
            if yesterday_stats and yesterday_stats.total_items > 0:
                return ((obj.total_items - yesterday_stats.total_items) / yesterday_stats.total_items) * 100
        except:
            pass
        return 0

    def get_growth_rate_orders(self, obj):
        """حساب معدل نمو الطلبات"""
        try:
            from django.utils import timezone
            yesterday_stats = DashboardStats.objects.filter(
                date=obj.date - timezone.timedelta(days=1)
            ).first()
            if yesterday_stats and yesterday_stats.total_orders > 0:
                return ((obj.total_orders - yesterday_stats.total_orders) / yesterday_stats.total_orders) * 100
        except:
            pass
        return 0

    def get_growth_rate_revenue(self, obj):
        """حساب معدل نمو الإيرادات"""
        try:
            from django.utils import timezone
            yesterday_stats = DashboardStats.objects.filter(
                date=obj.date - timezone.timedelta(days=1)
            ).first()
            if yesterday_stats and yesterday_stats.total_revenue > 0:
                return ((obj.total_revenue - yesterday_stats.total_revenue) / yesterday_stats.total_revenue) * 100
        except:
            pass
        return 0

class SystemLogSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = SystemLog
        fields = '__all__'

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return 'الآن'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'منذ {minutes} دقيقة'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'منذ {hours} ساعة'
        else:
            days = diff.days
            return f'منذ {days} يوم'

class AdminActivitySerializer(serializers.ModelSerializer):
    admin_user = UserPublicSerializer(read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = AdminActivity
        fields = '__all__'

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return 'الآن'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'منذ {minutes} دقيقة'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'منذ {hours} ساعة'
        else:
            days = diff.days
            return f'منذ {days} يوم'

class AdvancedAnalyticsSerializer(serializers.Serializer):
    """تحليلات متقدمة"""
    period = serializers.CharField()
    
    # تحليلات المستخدمين
    user_registration_trend = serializers.ListField()
    user_activity_trend = serializers.ListField()
    user_types_distribution = serializers.DictField()
    top_active_users = serializers.ListField()
    
    # تحليلات المنتجات
    items_creation_trend = serializers.ListField()
    categories_distribution = serializers.DictField()
    top_viewed_items = serializers.ListField()
    top_liked_items = serializers.ListField()
    items_by_condition = serializers.DictField()
    
    # تحليلات الطلبات
    orders_trend = serializers.ListField()
    revenue_trend = serializers.ListField()
    order_status_distribution = serializers.DictField()
    top_selling_categories = serializers.ListField()
    average_order_value_trend = serializers.ListField()
    
    # تحليلات الذكاء الاصطناعي
    ai_usage_trend = serializers.ListField()
    ai_success_rate_trend = serializers.ListField()
    ai_features_usage = serializers.DictField()

class RealtimeStatsSerializer(serializers.Serializer):
    """إحصائيات فورية"""
    online_users = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    current_orders = serializers.IntegerField()
    pending_notifications = serializers.IntegerField()
    system_load = serializers.FloatField()
    memory_usage = serializers.FloatField()
    database_connections = serializers.IntegerField()
    cache_hit_rate = serializers.FloatField()