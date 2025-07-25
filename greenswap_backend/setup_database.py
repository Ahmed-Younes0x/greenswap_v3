#!/usr/bin/env python
"""
سكريبت إعداد قاعدة البيانات الكامل
"""
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

def reset_database():
    """إعادة تعيين قاعدة البيانات"""
    try:
        print("🗑️ حذف قاعدة البيانات القديمة...")
        db_path = 'db.sqlite3'
        if os.path.exists(db_path):
            os.remove(db_path)
            print("✅ تم حذف قاعدة البيانات القديمة")
        
        print("📝 إنشاء migrations جديدة...")
        execute_from_command_line(['manage.py', 'makemigrations', 'accounts'])
        execute_from_command_line(['manage.py', 'makemigrations', 'core'])
        execute_from_command_line(['manage.py', 'makemigrations', 'items'])
        execute_from_command_line(['manage.py', 'makemigrations', 'orders'])
        execute_from_command_line(['manage.py', 'makemigrations', 'chat'])
        execute_from_command_line(['manage.py', 'makemigrations', 'notifications'])
        execute_from_command_line(['manage.py', 'makemigrations', 'ai_services'])
        execute_from_command_line(['manage.py', 'makemigrations', 'dashboard'])
        execute_from_command_line(['manage.py', 'makemigrations', 'reports'])
        
        print("🔄 تطبيق migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("👤 إنشاء مستخدم إداري...")
        User = get_user_model()
        admin_user = User.objects.create_superuser(
            email='admin@greenswap.eg',
            password='admin123',
            full_name='مدير النظام'
        )
        
        print("✅ تم إعداد قاعدة البيانات بنجاح!")
        print("📧 البريد الإلكتروني للمدير: admin@greenswap.eg")
        print("🔑 كلمة المرور: admin123")
        
    except Exception as e:
        print(f"❌ خطأ في إعداد قاعدة البيانات: {e}")

if __name__ == '__main__':
    reset_database()