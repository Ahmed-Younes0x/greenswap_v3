from django.urls import path
from .views import (
    DashboardOverviewView, AdvancedAnalyticsView, RealtimeStatsView,
    SystemLogsView, AdminActivityView, users_analytics, items_analytics,
    orders_analytics, revenue_analytics, system_health, export_data,
    performance_metrics, clear_cache, database_stats, generate_pdf_report,
    generate_excel_report
)

urlpatterns = [
    # لوحة التحكم الرئيسية
    path('overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('realtime/', RealtimeStatsView.as_view(), name='realtime-stats'),
    path('analytics/', AdvancedAnalyticsView.as_view(), name='advanced-analytics'),
    
    # التحليلات المفصلة
    path('analytics/users/', users_analytics, name='users-analytics'),
    path('analytics/items/', items_analytics, name='items-analytics'),
    path('analytics/orders/', orders_analytics, name='orders-analytics'),
    path('analytics/revenue/', revenue_analytics, name='revenue-analytics'),
    
    # السجلات والأنشطة
    path('logs/', SystemLogsView.as_view(), name='system-logs'),
    path('activities/', AdminActivityView.as_view(), name='admin-activities'),
    
    # صحة النظام والأداء
    path('health/', system_health, name='system-health'),
    path('performance/', performance_metrics, name='performance-metrics'),
    path('database/', database_stats, name='database-stats'),
    
    # أدوات الإدارة
    path('export/', export_data, name='export-data'),
    path('reports/pdf/', generate_pdf_report, name='generate-pdf-report'),
    path('reports/excel/', generate_excel_report, name='generate-excel-report'),
    path('cache/clear/', clear_cache, name='clear-cache'),
]