from celery import shared_task
from django.utils import timezone
from .models import DashboardStats, SystemLog
from .services import AnalyticsService

@shared_task
def generate_daily_stats():
    """توليد الإحصائيات اليومية"""
    try:
        stats = DashboardStats.generate_today_stats()
        
        SystemLog.objects.create(
            level='INFO',
            message=f'تم توليد إحصائيات {stats.date} بنجاح',
            module='dashboard.tasks'
        )
        
        return f"Generated stats for {stats.date}"
        
    except Exception as e:
        SystemLog.objects.create(
            level='ERROR',
            message=f'فشل في توليد الإحصائيات اليومية: {str(e)}',
            module='dashboard.tasks'
        )
        
        return f"Error generating daily stats: {str(e)}"

@shared_task
def cleanup_old_logs():
    """تنظيف السجلات القديمة"""
    try:
        # حذف السجلات الأقدم من 30 يوم
        cutoff_date = timezone.now() - timezone.timedelta(days=30)
        
        deleted_logs = SystemLog.objects.filter(created_at__lt=cutoff_date).delete()[0]
        
        SystemLog.objects.create(
            level='INFO',
            message=f'تم حذف {deleted_logs} سجل قديم',
            module='dashboard.tasks'
        )
        
        return f"Deleted {deleted_logs} old logs"
        
    except Exception as e:
        SystemLog.objects.create(
            level='ERROR',
            message=f'فشل في تنظيف السجلات القديمة: {str(e)}',
            module='dashboard.tasks'
        )
        
        return f"Error cleaning old logs: {str(e)}"

@shared_task
def generate_weekly_report():
    """توليد التقرير الأسبوعي"""
    try:
        # الحصول على تحليلات الأسبوع الماضي
        analytics = AnalyticsService.get_advanced_analytics(7)
        
        # يمكن إرسال التقرير بالبريد الإلكتروني للمديرين
        # أو حفظه في قاعدة البيانات
        
        SystemLog.objects.create(
            level='INFO',
            message='تم توليد التقرير الأسبوعي بنجاح',
            module='dashboard.tasks'
        )
        
        return "Weekly report generated successfully"
        
    except Exception as e:
        SystemLog.objects.create(
            level='ERROR',
            message=f'فشل في توليد التقرير الأسبوعي: {str(e)}',
            module='dashboard.tasks'
        )
        
        return f"Error generating weekly report: {str(e)}"

@shared_task
def monitor_system_health():
    """مراقبة صحة النظام"""
    try:
        import psutil
        
        # فحص استخدام المعالج
        cpu_usage = psutil.cpu_percent(interval=1)
        if cpu_usage > 80:
            SystemLog.objects.create(
                level='WARNING',
                message=f'استخدام المعالج مرتفع: {cpu_usage}%',
                module='dashboard.tasks'
            )
        
        # فحص استخدام الذاكرة
        memory_usage = psutil.virtual_memory().percent
        if memory_usage > 80:
            SystemLog.objects.create(
                level='WARNING',
                message=f'استخدام الذاكرة مرتفع: {memory_usage}%',
                module='dashboard.tasks'
            )
        
        # فحص مساحة القرص
        disk_usage = psutil.disk_usage('/').percent
        if disk_usage > 80:
            SystemLog.objects.create(
                level='WARNING',
                message=f'مساحة القرص منخفضة: {disk_usage}%',
                module='dashboard.tasks'
            )
        
        return "System health check completed"
        
    except Exception as e:
        SystemLog.objects.create(
            level='ERROR',
            message=f'فشل في مراقبة صحة النظام: {str(e)}',
            module='dashboard.tasks'
        )
        
        return f"Error monitoring system health: {str(e)}"