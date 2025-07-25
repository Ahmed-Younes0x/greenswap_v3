from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from items.models import Category
from core.models import SystemSettings

User = get_user_model()

class Command(BaseCommand):
    help = 'إعداد البيانات الأولية للنظام'

    def handle(self, *args, **options):
        self.stdout.write('بدء إعداد البيانات الأولية...')
        
        # إنشاء الفئات الأساسية
        self.create_categories()
        
        # إعداد إعدادات النظام
        self.setup_system_settings()
        
        self.stdout.write(
            self.style.SUCCESS('تم إعداد البيانات الأولية بنجاح!')
        )

    def create_categories(self):
        """إنشاء الفئات الأساسية"""
        categories = [
            {
                'name_ar': 'بلاستيك',
                'name_en': 'Plastic',
                'description_ar': 'جميع أنواع المواد البلاستيكية القابلة لإعادة التدوير',
                'description_en': 'All types of recyclable plastic materials',
                'icon': 'plastic',
                'color': '#2196F3'
            },
            {
                'name_ar': 'معادن',
                'name_en': 'Metals',
                'description_ar': 'المعادن والخردة المعدنية',
                'description_en': 'Metals and metal scraps',
                'icon': 'metal',
                'color': '#9E9E9E'
            },
            {
                'name_ar': 'ورق وكرتون',
                'name_en': 'Paper & Cardboard',
                'description_ar': 'الورق والكرتون المستعمل',
                'description_en': 'Used paper and cardboard',
                'icon': 'paper',
                'color': '#8BC34A'
            },
            {
                'name_ar': 'إلكترونيات',
                'name_en': 'Electronics',
                'description_ar': 'الأجهزة الإلكترونية المستعملة',
                'description_en': 'Used electronic devices',
                'icon': 'electronics',
                'color': '#FF9800'
            },
            {
                'name_ar': 'زجاج',
                'name_en': 'Glass',
                'description_ar': 'الزجاج والمواد الزجاجية',
                'description_en': 'Glass and glass materials',
                'icon': 'glass',
                'color': '#00BCD4'
            },
            {
                'name_ar': 'نسيج',
                'name_en': 'Textile',
                'description_ar': 'الملابس والأقمشة المستعملة',
                'description_en': 'Used clothes and fabrics',
                'icon': 'textile',
                'color': '#E91E63'
            }
        ]

        for i, cat_data in enumerate(categories):
            category, created = Category.objects.get_or_create(
                name_ar=cat_data['name_ar'],
                defaults={
                    **cat_data,
                    'sort_order': i * 10
                }
            )
            if created:
                self.stdout.write(f'تم إنشاء فئة: {category.name_ar}')

    def setup_system_settings(self):
        """إعداد إعدادات النظام"""
        settings = [
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
                'key': 'item_expiry_days',
                'value': '30',
                'description': 'عدد أيام انتهاء صلاحية المنتج'
            },
            {
                'key': 'enable_ai_features',
                'value': 'true',
                'description': 'تفعيل ميزات الذكاء الاصطناعي'
            },
            {
                'key': 'maintenance_mode',
                'value': 'false',
                'description': 'وضع الصيانة'
            }
        ]

        for setting_data in settings:
            setting = SystemSettings.set_setting(**setting_data)
            self.stdout.write(f'تم إعداد: {setting.key}')