#!/usr/bin/env python
"""
سكريبت تشغيل الخادم مع التحقق من قاعدة البيانات
"""
import os
import django
import sys
import subprocess

# إضافة مسار المشروع
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greenswap_backend.settings')

def check_and_setup():
    """فحص وإعداد قاعدة البيانات"""
    try:
        django.setup()
        from django.db import connection
        from django.contrib.auth import get_user_model
        
        # فحص الاتصال بقاعدة البيانات
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            
        if len(tables) == 0:
            print("⚠️ قاعدة البيانات فارغة - سيتم إعدادها...")
            subprocess.run([sys.executable, 'setup_database.py'])
        else:
            print("✅ قاعدة البيانات جاهزة")
            
        # التحقق من وجود مستخدم إداري
        User = get_user_model()
        if not User.objects.filter(is_superuser=True).exists():
            print("👤 إنشاء مستخدم إداري...")
            User.objects.create_superuser(
                email='admin@greenswap.eg',
                password='admin123',
                full_name='مدير النظام'
            )
            print("✅ تم إنشاء المستخدم الإداري")
            
    except Exception as e:
        print(f"❌ خطأ في الإعداد: {e}")
        print("🔧 محاولة إصلاح قاعدة البيانات...")
        subprocess.run([sys.executable, 'setup_database.py'])

def start_server():
    """تشغيل الخادم"""
    try:
        print("🚀 بدء تشغيل خادم Django...")
        print("🌐 الخادم سيعمل على: http://127.0.0.1:8000")
        print("🔧 لوحة الإدارة: http://127.0.0.1:8000/admin")
        print("📧 المدير: admin@greenswap.eg")
        print("🔑 كلمة المرور: admin123")
        print("-" * 50)
        
        subprocess.run([sys.executable, 'manage.py', 'runserver', '127.0.0.1:8000'])
        
    except KeyboardInterrupt:
        print("\n🛑 تم إيقاف الخادم")
    except Exception as e:
        print(f"❌ خطأ في تشغيل الخادم: {e}")

if __name__ == '__main__':
    check_and_setup()
    start_server()