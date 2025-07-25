from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta, datetime
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import connection
import json
import csv
import os
from django.conf import settings

from items.models import Item, Category
from orders.models import Order
from chat.models import Conversation, Message
from ai_services.models import AIAnalysis
from notifications.models import Notification
from reports.models import Report

User = get_user_model()

class AnalyticsService:
    """خدمة التحليلات المتقدمة"""
    
    @staticmethod
    def get_advanced_analytics(days=30):
        """الحصول على تحليلات متقدمة"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        return {
            'period': f'{days} days',
            'user_registration_trend': AnalyticsService._get_user_registration_trend(start_date, end_date),
            'user_activity_trend': AnalyticsService._get_user_activity_trend(start_date, end_date),
            'user_types_distribution': AnalyticsService._get_user_types_distribution(),
            'top_active_users': AnalyticsService._get_top_active_users(),
            'items_creation_trend': AnalyticsService._get_items_creation_trend(start_date, end_date),
            'categories_distribution': AnalyticsService._get_categories_distribution(),
            'top_viewed_items': AnalyticsService._get_top_viewed_items(),
            'top_liked_items': AnalyticsService._get_top_liked_items(),
            'items_by_condition': AnalyticsService._get_items_by_condition(),
            'orders_trend': AnalyticsService._get_orders_trend(start_date, end_date),
            'revenue_trend': AnalyticsService._get_revenue_trend(start_date, end_date),
            'order_status_distribution': AnalyticsService._get_order_status_distribution(),
            'top_selling_categories': AnalyticsService._get_top_selling_categories(),
            'average_order_value_trend': AnalyticsService._get_average_order_value_trend(start_date, end_date),
            'ai_usage_trend': AnalyticsService._get_ai_usage_trend(start_date, end_date),
            'ai_success_rate_trend': AnalyticsService._get_ai_success_rate_trend(start_date, end_date),
            'ai_features_usage': AnalyticsService._get_ai_features_usage(),
        }
    
    @staticmethod
    def _get_user_registration_trend(start_date, end_date):
        """اتجاه تسجيل المستخدمين"""
        registrations = User.objects.filter(
            date_joined__date__range=[start_date, end_date]
        ).extra(
            select={'day': 'date(date_joined)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        return [
            {'date': reg['day'].strftime('%Y-%m-%d'), 'count': reg['count']}
            for reg in registrations
        ]
    
    @staticmethod
    def _get_user_activity_trend(start_date, end_date):
        """اتجاه نشاط المستخدمين"""
        activities = User.objects.filter(
            last_login__date__range=[start_date, end_date]
        ).extra(
            select={'day': 'date(last_login)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        return [
            {'date': act['day'].strftime('%Y-%m-%d'), 'count': act['count']}
            for act in activities
        ]
    
    @staticmethod
    def _get_user_types_distribution():
        """توزيع أنواع المستخدمين"""
        distribution = User.objects.values('user_type').annotate(count=Count('id'))
        return {item['user_type']: item['count'] for item in distribution}
    
    @staticmethod
    def _get_top_active_users(limit=10):
        """أكثر المستخدمين نشاطاً"""
        users = User.objects.annotate(
            items_count=Count('items'),
            orders_count=Count('orders_as_buyer') + Count('orders_as_seller')
        ).order_by('-items_count', '-orders_count')[:limit]
        
        return [
            {
                'id': user.id,
                'name': user.full_name,
                'email': user.email,
                'items_count': user.items_count,
                'orders_count': user.orders_count,
                'rating': user.rating_average
            }
            for user in users
        ]
    
    @staticmethod
    def _get_items_creation_trend(start_date, end_date):
        """اتجاه إنشاء المنتجات"""
        items = Item.objects.filter(
            created_at__date__range=[start_date, end_date]
        ).extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        return [
            {'date': item['day'].strftime('%Y-%m-%d'), 'count': item['count']}
            for item in items
        ]
    
    @staticmethod
    def _get_categories_distribution():
        """توزيع الفئات"""
        distribution = Item.objects.values('category__name_ar').annotate(count=Count('id'))
        return {item['category__name_ar']: item['count'] for item in distribution}
    
    @staticmethod
    def _get_top_viewed_items(limit=10):
        """أكثر المنتجات مشاهدة"""
        items = Item.objects.order_by('-views_count')[:limit]
        return [
            {
                'id': item.id,
                'title': item.title,
                'views_count': item.views_count,
                'likes_count': item.likes_count,
                'owner': item.owner.full_name
            }
            for item in items
        ]
    
    @staticmethod
    def _get_top_liked_items(limit=10):
        """أكثر المنتجات إعجاباً"""
        items = Item.objects.order_by('-likes_count')[:limit]
        return [
            {
                'id': item.id,
                'title': item.title,
                'likes_count': item.likes_count,
                'views_count': item.views_count,
                'owner': item.owner.full_name
            }
            for item in items
        ]
    
    @staticmethod
    def _get_items_by_condition():
        """المنتجات حسب الحالة"""
        distribution = Item.objects.values('condition').annotate(count=Count('id'))
        return {item['condition']: item['count'] for item in distribution}
    
    @staticmethod
    def _get_orders_trend(start_date, end_date):
        """اتجاه الطلبات"""
        orders = Order.objects.filter(
            created_at__date__range=[start_date, end_date]
        ).extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        return [
            {'date': order['day'].strftime('%Y-%m-%d'), 'count': order['count']}
            for order in orders
        ]
    
    @staticmethod
    def _get_revenue_trend(start_date, end_date):
        """اتجاه الإيرادات"""
        revenues = Order.objects.filter(
            completed_at__date__range=[start_date, end_date],
            status='completed'
        ).extra(
            select={'day': 'date(completed_at)'}
        ).values('day').annotate(revenue=Sum('total_price')).order_by('day')
        
        return [
            {'date': rev['day'].strftime('%Y-%m-%d'), 'revenue': float(rev['revenue'] or 0)}
            for rev in revenues
        ]
    
    @staticmethod
    def _get_order_status_distribution():
        """توزيع حالات الطلبات"""
        distribution = Order.objects.values('status').annotate(count=Count('id'))
        return {item['status']: item['count'] for item in distribution}
    
    @staticmethod
    def _get_top_selling_categories(limit=10):
        """أكثر الفئات مبيعاً"""
        categories = Order.objects.filter(status='completed').values(
            'item__category__name_ar'
        ).annotate(
            count=Count('id'),
            revenue=Sum('total_price')
        ).order_by('-count')[:limit]
        
        return [
            {
                'category': cat['item__category__name_ar'],
                'orders_count': cat['count'],
                'revenue': float(cat['revenue'] or 0)
            }
            for cat in categories
        ]
    
    @staticmethod
    def _get_average_order_value_trend(start_date, end_date):
        """اتجاه متوسط قيمة الطلب"""
        values = Order.objects.filter(
            created_at__date__range=[start_date, end_date]
        ).extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(avg_value=Avg('total_price')).order_by('day')
        
        return [
            {'date': val['day'].strftime('%Y-%m-%d'), 'avg_value': float(val['avg_value'] or 0)}
            for val in values
        ]
    
    @staticmethod
    def _get_ai_usage_trend(start_date, end_date):
        """اتجاه استخدام الذكاء الاصطناعي"""
        analyses = AIAnalysis.objects.filter(
            created_at__date__range=[start_date, end_date]
        ).extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        return [
            {'date': analysis['day'].strftime('%Y-%m-%d'), 'count': analysis['count']}
            for analysis in analyses
        ]
    
    @staticmethod
    def _get_ai_success_rate_trend(start_date, end_date):
        """اتجاه معدل نجاح الذكاء الاصطناعي"""
        daily_stats = []
        current_date = start_date
        
        while current_date <= end_date:
            total = AIAnalysis.objects.filter(created_at__date=current_date).count()
            success = AIAnalysis.objects.filter(
                created_at__date=current_date,
                status='completed'
            ).count()
            
            success_rate = (success / total * 100) if total > 0 else 0
            
            daily_stats.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'success_rate': success_rate
            })
            
            current_date += timedelta(days=1)
        
        return daily_stats
    
    @staticmethod
    def _get_ai_features_usage():
        """استخدام ميزات الذكاء الاصطناعي"""
        distribution = AIAnalysis.objects.values('analysis_type').annotate(count=Count('id'))
        return {item['analysis_type']: item['count'] for item in distribution}
    
    @staticmethod
    def get_users_analytics(days=30):
        """تحليلات المستخدمين المفصلة"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        return {
            'total_users': User.objects.count(),
            'new_users': User.objects.filter(date_joined__date__gte=start_date).count(),
            'active_users': User.objects.filter(last_login__date__gte=start_date).count(),
            'verified_users': User.objects.filter(is_verified=True).count(),
            'user_types': AnalyticsService._get_user_types_distribution(),
            'registration_trend': AnalyticsService._get_user_registration_trend(start_date, end_date),
            'activity_trend': AnalyticsService._get_user_activity_trend(start_date, end_date),
            'top_users': AnalyticsService._get_top_active_users(),
        }
    
    @staticmethod
    def get_items_analytics(days=30):
        """تحليلات المنتجات المفصلة"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        return {
            'total_items': Item.objects.count(),
            'new_items': Item.objects.filter(created_at__date__gte=start_date).count(),
            'available_items': Item.objects.filter(status='available').count(),
            'sold_items': Item.objects.filter(status='sold').count(),
            'categories_distribution': AnalyticsService._get_categories_distribution(),
            'condition_distribution': AnalyticsService._get_items_by_condition(),
            'creation_trend': AnalyticsService._get_items_creation_trend(start_date, end_date),
            'top_viewed': AnalyticsService._get_top_viewed_items(),
            'top_liked': AnalyticsService._get_top_liked_items(),
        }
    
    @staticmethod
    def get_orders_analytics(days=30):
        """تحليلات الطلبات المفصلة"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        return {
            'total_orders': Order.objects.count(),
            'new_orders': Order.objects.filter(created_at__date__gte=start_date).count(),
            'completed_orders': Order.objects.filter(status='completed').count(),
            'pending_orders': Order.objects.filter(status='pending').count(),
            'status_distribution': AnalyticsService._get_order_status_distribution(),
            'orders_trend': AnalyticsService._get_orders_trend(start_date, end_date),
            'top_selling_categories': AnalyticsService._get_top_selling_categories(),
        }
    
    @staticmethod
    def get_revenue_analytics(days=30):
        """تحليلات الإيرادات المفصلة"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        completed_orders = Order.objects.filter(status='completed')
        period_orders = completed_orders.filter(completed_at__date__gte=start_date)
        
        return {
            'total_revenue': completed_orders.aggregate(total=Sum('total_price'))['total'] or 0,
            'period_revenue': period_orders.aggregate(total=Sum('total_price'))['total'] or 0,
            'average_order_value': completed_orders.aggregate(avg=Avg('total_price'))['avg'] or 0,
            'revenue_trend': AnalyticsService._get_revenue_trend(start_date, end_date),
            'avg_order_value_trend': AnalyticsService._get_average_order_value_trend(start_date, end_date),
        }
    
    @staticmethod
    def get_performance_metrics(days=7):
        """مقاييس الأداء"""
        # يمكن تحسين هذه الوظيفة لتشمل مقاييس أداء حقيقية
        return {
            'response_time_avg': 150,  # milliseconds
            'error_rate': 0.5,  # percentage
            'uptime': 99.9,  # percentage
            'database_queries_avg': 25,
            'cache_hit_rate': 85.5,  # percentage
        }

class RealtimeStatsService:
    """خدمة الإحصائيات الفورية"""
    
    @staticmethod
    def get_realtime_stats():
        """الحصول على إحصائيات فورية"""
        # استخدام التخزين المؤقت للإحصائيات الفورية
        cache_key = 'realtime_stats'
        stats = cache.get(cache_key)
        
        if not stats:
            stats = RealtimeStatsService._calculate_realtime_stats()
            cache.set(cache_key, stats, 60)  # تخزين لمدة دقيقة
        
        return stats
    
    @staticmethod
    def _calculate_realtime_stats():
        """حساب الإحصائيات الفورية"""
        import psutil
        
        # إحصائيات المستخدمين النشطين (آخر 15 دقيقة)
        fifteen_minutes_ago = timezone.now() - timedelta(minutes=15)
        online_users = User.objects.filter(last_login__gte=fifteen_minutes_ago).count()
        
        # الطلبات الحالية (معلقة ومقبولة)
        current_orders = Order.objects.filter(status__in=['pending', 'accepted']).count()
        
        # الإشعارات المعلقة
        pending_notifications = Notification.objects.filter(is_read=False).count()
        
        # إحصائيات النظام
        system_load = psutil.cpu_percent(interval=1)
        memory_usage = psutil.virtual_memory().percent
        
        # إحصائيات قاعدة البيانات
        with connection.cursor() as cursor:
            cursor.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active'")
            db_connections = cursor.fetchone()[0]
        
        return {
            'online_users': online_users,
            'active_sessions': online_users,  # تقريبي
            'current_orders': current_orders,
            'pending_notifications': pending_notifications,
            'system_load': system_load,
            'memory_usage': memory_usage,
            'database_connections': db_connections,
            'cache_hit_rate': 85.0,  # يمكن تحسينه للحصول على القيمة الحقيقية
        }

class ExportService:
    """خدمة تصدير البيانات"""
    
    @staticmethod
    def export_data(data_type, format_type='csv', date_from=None, date_to=None, user=None):
        """تصدير البيانات"""
        
        # إنشاء مجلد التصدير إذا لم يكن موجوداً
        export_dir = os.path.join(settings.MEDIA_ROOT, 'exports')
        os.makedirs(export_dir, exist_ok=True)
        
        # اسم الملف
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f'{data_type}_{timestamp}.{format_type}'
        file_path = os.path.join(export_dir, filename)
        
        # الحصول على البيانات
        data = ExportService._get_export_data(data_type, date_from, date_to)
        
        # تصدير البيانات حسب النوع
        if format_type == 'csv':
            ExportService._export_to_csv(data, file_path)
        elif format_type == 'json':
            ExportService._export_to_json(data, file_path)
        elif format_type == 'excel':
            ExportService._export_to_excel(data, file_path)
        
        return file_path
    
    @staticmethod
    def _get_export_data(data_type, date_from=None, date_to=None):
        """الحصول على البيانات للتصدير"""
        
        if data_type == 'users':
            queryset = User.objects.all()
            if date_from:
                queryset = queryset.filter(date_joined__date__gte=date_from)
            if date_to:
                queryset = queryset.filter(date_joined__date__lte=date_to)
            
            return [
                {
                    'ID': user.id,
                    'الاسم': user.full_name,
                    'البريد الإلكتروني': user.email,
                    'نوع المستخدم': user.get_user_type_display(),
                    'موثق': 'نعم' if user.is_verified else 'لا',
                    'تاريخ التسجيل': user.date_joined.strftime('%Y-%m-%d %H:%M'),
                    'آخر دخول': user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else 'لم يسجل دخول',
                }
                for user in queryset
            ]
        
        elif data_type == 'items':
            queryset = Item.objects.select_related('owner', 'category')
            if date_from:
                queryset = queryset.filter(created_at__date__gte=date_from)
            if date_to:
                queryset = queryset.filter(created_at__date__lte=date_to)
            
            return [
                {
                    'ID': item.id,
                    'العنوان': item.title,
                    'الفئة': item.category.name_ar,
                    'المالك': item.owner.full_name,
                    'السعر': str(item.price),
                    'الحالة': item.get_condition_display(),
                    'الحالة': item.get_status_display(),
                    'المشاهدات': item.views_count,
                    'الإعجابات': item.likes_count,
                    'تاريخ الإنشاء': item.created_at.strftime('%Y-%m-%d %H:%M'),
                }
                for item in queryset
            ]
        
        elif data_type == 'orders':
            queryset = Order.objects.select_related('buyer', 'seller', 'item')
            if date_from:
                queryset = queryset.filter(created_at__date__gte=date_from)
            if date_to:
                queryset = queryset.filter(created_at__date__lte=date_to)
            
            return [
                {
                    'رقم الطلب': order.order_number,
                    'المشتري': order.buyer.full_name,
                    'البائع': order.seller.full_name,
                    'المنتج': order.item.title,
                    'الكمية': order.quantity,
                    'المبلغ الإجمالي': str(order.total_price),
                    'الحالة': order.get_status_display(),
                    'تاريخ الطلب': order.created_at.strftime('%Y-%m-%d %H:%M'),
                    'تاريخ الإكمال': order.completed_at.strftime('%Y-%m-%d %H:%M') if order.completed_at else '',
                }
                for order in queryset
            ]
        
        elif data_type == 'reports':
            queryset = Report.objects.select_related('reporter', 'reviewed_by')
            if date_from:
                queryset = queryset.filter(created_at__date__gte=date_from)
            if date_to:
                queryset = queryset.filter(created_at__date__lte=date_to)
            
            return [
                {
                    'ID': report.id,
                    'المبلغ': report.reporter.full_name,
                    'نوع البلاغ': report.get_report_type_display(),
                    'العنوان': report.title,
                    'الوصف': report.description,
                    'الحالة': report.get_status_display(),
                    'الأولوية': report.get_priority_display(),
                    'تمت المراجعة بواسطة': report.reviewed_by.full_name if report.reviewed_by else '',
                    'تاريخ الإنشاء': report.created_at.strftime('%Y-%m-%d %H:%M'),
                    'تاريخ الحل': report.resolved_at.strftime('%Y-%m-%d %H:%M') if report.resolved_at else '',
                }
                for report in queryset
            ]
        
        return []
    
    @staticmethod
    def _export_to_csv(data, file_path):
        """تصدير إلى CSV"""
        if not data:
            return
        
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = data[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
    
    @staticmethod
    def _export_to_json(data, file_path):
        """تصدير إلى JSON"""
        with open(file_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(data, jsonfile, ensure_ascii=False, indent=2)
    
    @staticmethod
    def _export_to_excel(data, file_path):
        """تصدير إلى Excel"""
        try:
            import pandas as pd
            df = pd.DataFrame(data)
            df.to_excel(file_path, index=False, engine='openpyxl')
        except ImportError:
            # إذا لم يكن pandas متاحاً، استخدم CSV
            ExportService._export_to_csv(data, file_path.replace('.xlsx', '.csv'))