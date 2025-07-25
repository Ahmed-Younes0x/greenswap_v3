#!/usr/bin/env python
import os
import django
import sys

# إضافة مسار المشروع
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greenswap_backend.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
from django.contrib.auth import get_user_model
from items.models import Category
from core.models import SystemSettings

def check_database():
    """فحص حالة قاعدة البيانات"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"✅ عدد الجداول الموجودة: {len(tables)}")
            
            if len(tables) == 0:
                print("⚠️ قاعدة البيانات فارغة - سيتم إنشاء الجداول")
                return False
            else:
                print("✅ قاعدة البيانات تحتوي على جداول")
                return True
                
    except Exception as e:
        print(f"❌ خطأ في فحص قاعدة البيانات: {e}")
        return False

def setup_initial_data():
    """إعداد البيانات الأولية"""
    try:
        User = get_user_model()
        
        # إنشاء الفئات الأساسية
        categories_data = [
            {
                'name_ar': 'بلاستيك',
                'name_en': 'Plastic',
                'description_ar': 'جميع أنواع المواد البلاستيكية القابلة لإعادة التدوير',
                'description_en': 'All types of recyclable plastic materials',
                'icon': 'cup-straw',
                'color': '#2196F3'
            },
            {
                'name_ar': 'معادن',
                'name_en': 'Metals',
                'description_ar': 'المعادن والخردة المعدنية',
                'description_en': 'Metals and metal scraps',
                'icon': 'gear',
                'color': '#9E9E9E'
            },
            {
                'name_ar': 'ورق وكرتون',
                'name_en': 'Paper & Cardboard',
                'description_ar': 'الورق والكرتون المستعمل',
                'description_en': 'Used paper and cardboard',
                'icon': 'file-text',
                'color': '#8BC34A'
            },
            {
                'name_ar': 'إلكترونيات',
                'name_en': 'Electronics',
                'description_ar': 'الأجهزة الإلكترونية المستعملة',
                'description_en': 'Used electronic devices',
                'icon': 'phone',
                'color': '#FF9800'
            },
            {
                'name_ar': 'زجاج',
                'name_en': 'Glass',
                'description_ar': 'الزجاج والمواد الزجاجية',
                'description_en': 'Glass and glass materials',
                'icon': 'cup',
                'color': '#00BCD4'
            },
            {
                'name_ar': 'نسيج',
                'name_en': 'Textile',
                'description_ar': 'الملابس والأقمشة المستعملة',
                'description_en': 'Used clothes and fabrics',
                'icon': 'scissors',
                'color': '#E91E63'
            }
        ]

        for i, cat_data in enumerate(categories_data):
            category, created = Category.objects.get_or_create(
                name_ar=cat_data['name_ar'],
                defaults={
                    **cat_data,
                    'sort_order': i * 10
                }
            )
            if created:
                print(f"✅ تم إنشاء فئة: {category.name_ar}")

        # إعداد إعدادات النظام
        settings_data = [
            {
                'key': 'site_name',
                'value': 'GreenSwap Egypt',
                'description': 'اسم الموقع'
            },
            {
                'key': 'site_description',
                'value': 'منصة رقمية لإعادة تدوير المخلفات في مصر',
                'description': 'وصف الموقع'
            },
            {
                'key': 'max_images_per_item',
                'value': '5',
                'description': 'الحد الأقصى لعدد الصور لكل منتج'
            },
            {
                'key': 'enable_ai_features',
                'value': 'true',
                'description': 'تفعيل ميزات الذكاء الاصطناعي'
            }
        ]

        for setting_data in settings_data:
            setting = SystemSettings.set_setting(**setting_data)
            print(f"✅ تم إعداد: {setting.key}")

        print("✅ تم إعداد البيانات الأولية بنجاح!")
        
    except Exception as e:
        print(f"❌ خطأ في إعداد البيانات الأولية: {e}")

def main():
    """الدالة الرئيسية"""
    print("🔧 بدء إصلاح قاعدة البيانات...")
    
    # فحص قاعدة البيانات
    db_exists = check_database()
    
    if not db_exists:
        print("📝 إنشاء الجداول...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        execute_from_command_line(['manage.py', 'migrate'])
    
    # إعداد البيانات الأولية
    setup_initial_data()
    
    print("✅ تم إصلاح قاعدة البيانات بنجاح!")

if __name__ == '__main__':
    main()