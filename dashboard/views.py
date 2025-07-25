from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta, datetime
from django.contrib.auth import get_user_model
from django.core.cache import cache
import psutil
import os

from .models import DashboardStats, SystemLog, AdminActivity
from .serializers import (
    DashboardStatsSerializer, SystemLogSerializer, AdminActivitySerializer,
    AdvancedAnalyticsSerializer, RealtimeStatsSerializer
)
from .services import AnalyticsService, RealtimeStatsService
from .permissions import IsAdminUser

# إضافة تقارير PDF وExcel
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.http import HttpResponse
import io

User = get_user_model()

class DashboardOverviewView(generics.RetrieveAPIView):
    """نظرة عامة على لوحة التحكم"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        # توليد إحصائيات اليوم
        today_stats = DashboardStats.generate_today_stats()
        
        # إحصائيات الأسبوع الماضي
        week_ago = timezone.now().date() - timedelta(days=7)
        week_stats = DashboardStats.objects.filter(date__gte=week_ago)
        
        # إحصائيات الشهر الماضي
        month_ago = timezone.now().date() - timedelta(days=30)
        month_stats = DashboardStats.objects.filter(date__gte=month_ago)
        
        # حساب المعدلات
        week_revenue = week_stats.aggregate(total=Sum('revenue_today'))['total'] or 0
        month_revenue = month_stats.aggregate(total=Sum('revenue_today'))['total'] or 0
        
        data = {
            'today': DashboardStatsSerializer(today_stats).data,
            'week_summary': {
                'total_revenue': week_revenue,
                'new_users': week_stats.aggregate(total=Sum('new_users_today'))['total'] or 0,
                'new_orders': week_stats.aggregate(total=Sum('new_orders_today'))['total'] or 0,
                'new_items': week_stats.aggregate(total=Sum('new_items_today'))['total'] or 0,
            },
            'month_summary': {
                'total_revenue': month_revenue,
                'new_users': month_stats.aggregate(total=Sum('new_users_today'))['total'] or 0,
                'new_orders': month_stats.aggregate(total=Sum('new_orders_today'))['total'] or 0,
                'new_items': month_stats.aggregate(total=Sum('new_items_today'))['total'] or 0,
            },
            'quick_stats': {
                'pending_orders': today_stats.pending_orders,
                'active_users_today': today_stats.active_users_today,
                'ai_analyses_today': today_stats.ai_analyses_today,
                'new_conversations_today': today_stats.new_conversations_today,
            }
        }
        
        return Response(data)

class AdvancedAnalyticsView(generics.GenericAPIView):
    """تحليلات متقدمة"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        period = request.query_params.get('period', '30')  # آخر 30 يوم افتراضياً
        
        try:
            days = int(period)
        except ValueError:
            days = 30
        
        analytics_data = AnalyticsService.get_advanced_analytics(days)
        serializer = AdvancedAnalyticsSerializer(analytics_data)
        
        return Response(serializer.data)

class RealtimeStatsView(generics.GenericAPIView):
    """إحصائيات فورية"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        stats = RealtimeStatsService.get_realtime_stats()
        serializer = RealtimeStatsSerializer(stats)
        
        return Response(serializer.data)

class SystemLogsView(generics.ListAPIView):
    """سجلات النظام"""
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = SystemLog.objects.all()
        
        # فلترة حسب المستوى
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)
        
        # فلترة حسب الوحدة
        module = self.request.query_params.get('module')
        if module:
            queryset = queryset.filter(module=module)
        
        # فلترة حسب التاريخ
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset.order_by('-created_at')

class AdminActivityView(generics.ListAPIView):
    """أنشطة المديرين"""
    serializer_class = AdminActivitySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = AdminActivity.objects.all()
        
        # فلترة حسب نوع العملية
        action_type = self.request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        
        # فلترة حسب المدير
        admin_id = self.request.query_params.get('admin_id')
        if admin_id:
            queryset = queryset.filter(admin_user_id=admin_id)
        
        return queryset.order_by('-created_at')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def users_analytics(request):
    """تحليلات المستخدمين"""
    period = int(request.query_params.get('period', 30))
    
    analytics = AnalyticsService.get_users_analytics(period)
    
    return Response(analytics)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def items_analytics(request):
    """تحليلات المنتجات"""
    period = int(request.query_params.get('period', 30))
    
    analytics = AnalyticsService.get_items_analytics(period)
    
    return Response(analytics)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def orders_analytics(request):
    """تحليلات الطلبات"""
    period = int(request.query_params.get('period', 30))
    
    analytics = AnalyticsService.get_orders_analytics(period)
    
    return Response(analytics)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def revenue_analytics(request):
    """تحليلات الإيرادات"""
    period = int(request.query_params.get('period', 30))
    
    analytics = AnalyticsService.get_revenue_analytics(period)
    
    return Response(analytics)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def system_health(request):
    """صحة النظام"""
    health_data = {
        'cpu_usage': psutil.cpu_percent(interval=1),
        'memory_usage': psutil.virtual_memory().percent,
        'disk_usage': psutil.disk_usage('/').percent,
        'database_status': 'healthy',  # يمكن تحسينه لفحص قاعدة البيانات
        'cache_status': 'healthy',     # يمكن تحسينه لفحص Redis
        'uptime': psutil.boot_time(),
        'active_connections': len(psutil.net_connections()),
    }
    
    return Response(health_data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def generate_pdf_report(request):
    """توليد تقرير PDF"""
    report_type = request.data.get('type', 'users')
    date_from = request.data.get('date_from')
    date_to = request.data.get('date_to')
    
    try:
        # إنشاء ملف PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        # الحصول على البيانات
        from .services import ExportService
        data = ExportService._get_export_data(report_type, date_from, date_to)
        
        if not data:
            return Response({'error': 'لا توجد بيانات للتصدير'}, status=status.HTTP_400_BAD_REQUEST)
        
        # إنشاء الجدول
        table_data = []
        headers = list(data[0].keys())
        table_data.append(headers)
        
        for row in data:
            table_data.append(list(row.values()))
        
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        # بناء المستند
        story = []
        styles = getSampleStyleSheet()
        title = Paragraph(f"تقرير {report_type}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        story.append(table)
        
        doc.build(story)
        
        # إرجاع الملف
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="report_{report_type}.pdf"'
        
        return response
        
    except Exception as e:
        return Response({'error': f'فشل في توليد التقرير: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def generate_excel_report(request):
    """توليد تقرير Excel"""
    report_type = request.data.get('type', 'users')
    date_from = request.data.get('date_from')
    date_to = request.data.get('date_to')
    
    try:
        import pandas as pd
        from django.http import HttpResponse
        import io
        
        # الحصول على البيانات
        from .services import ExportService
        data = ExportService._get_export_data(report_type, date_from, date_to)
        
        if not data:
            return Response({'error': 'لا توجد بيانات للتصدير'}, status=status.HTTP_400_BAD_REQUEST)
        
        # إنشاء DataFrame
        df = pd.DataFrame(data)
        
        # إنشاء ملف Excel
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name=f'تقرير {report_type}', index=False)
        
        buffer.seek(0)
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="report_{report_type}.xlsx"'
        
        return response
        
    except ImportError:
        return Response({'error': 'مكتبة pandas غير متاحة'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': f'فشل في توليد التقرير: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def export_data(request):
    """تصدير البيانات"""
    data_type = request.data.get('type')  # users, items, orders, etc.
    format_type = request.data.get('format', 'csv')  # csv, excel, json
    date_from = request.data.get('date_from')
    date_to = request.data.get('date_to')
    
    try:
        from .services import ExportService
        
        file_path = ExportService.export_data(
            data_type=data_type,
            format_type=format_type,
            date_from=date_from,
            date_to=date_to,
            user=request.user
        )
        
        # تسجيل النشاط
        AdminActivity.objects.create(
            admin_user=request.user,
            action_type='export',
            description=f'تصدير بيانات {data_type} بصيغة {format_type}',
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'message': 'تم تصدير البيانات بنجاح',
            'file_path': file_path,
            'download_url': f'/api/dashboard/download/{os.path.basename(file_path)}/'
        })
        
    except Exception as e:
        return Response({
            'error': f'فشل في تصدير البيانات: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def performance_metrics(request):
    """مقاييس الأداء"""
    period = int(request.query_params.get('period', 7))
    
    metrics = AnalyticsService.get_performance_metrics(period)
    
    return Response(metrics)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def clear_cache(request):
    """مسح التخزين المؤقت"""
    try:
        cache.clear()
        
        # تسجيل النشاط
        AdminActivity.objects.create(
            admin_user=request.user,
            action_type='update',
            description='مسح التخزين المؤقت',
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'message': 'تم مسح التخزين المؤقت بنجاح'})
        
    except Exception as e:
        return Response({
            'error': f'فشل في مسح التخزين المؤقت: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminUser])
def database_stats(request):
    """إحصائيات قاعدة البيانات"""
    from django.db import connection
    
    with connection.cursor() as cursor:
        # حجم قاعدة البيانات
        cursor.execute("""
            SELECT pg_size_pretty(pg_database_size(current_database())) as size
        """)
        db_size = cursor.fetchone()[0]
        
        # عدد الاتصالات النشطة
        cursor.execute("""
            SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
        """)
        active_connections = cursor.fetchone()[0]
        
        # أكبر الجداول
        cursor.execute("""
            SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            LIMIT 10
        """)
        largest_tables = cursor.fetchall()
    
    return Response({
        'database_size': db_size,
        'active_connections': active_connections,
        'largest_tables': [
            {'schema': row[0], 'table': row[1], 'size': row[2]}
            for row in largest_tables
        ]
    })