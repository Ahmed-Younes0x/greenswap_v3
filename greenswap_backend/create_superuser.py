#!/usr/bin/env python
import os
import django
import sys

# إضافة مسار المشروع
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'greenswap_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_superuser():
    """إنشاء مستخدم إداري"""
    try:
        # التحقق من وجود مستخدم إداري
        if User.objects.filter(is_superuser=True).exists():
            print("✅ يوجد مستخدم إداري بالفعل")
            admin_user = User.objects.filter(is_superuser=True).first()
            print(f"📧 البريد الإلكتروني: {admin_user.email}")
            return
        
        # إنشاء مستخدم إداري جديد
        admin_user = User.objects.create_superuser(
            email='admin@greenswap.eg',
            password='admin123',
            full_name='مدير النظام',
            user_type='individual'
        )
        
        print("✅ تم إنشاء المستخدم الإداري بنجاح!")
        print("📧 البريد الإلكتروني: admin@greenswap.eg")
        print("🔑 كلمة المرور: admin123")
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء المستخدم الإداري: {e}")

if __name__ == '__main__':
    create_superuser()