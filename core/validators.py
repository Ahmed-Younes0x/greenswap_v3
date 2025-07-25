from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re

def validate_phone_number(value):
    """التحقق من رقم الهاتف المصري"""
    pattern = r'^(\+20|0)?1[0125]\d{8}$'
    if not re.match(pattern, value):
        raise ValidationError('رقم الهاتف غير صحيح')

def validate_image_size(image):
    """التحقق من حجم الصورة"""
    max_size = 5 * 1024 * 1024  # 5MB
    if image.size > max_size:
        raise ValidationError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')

def validate_image_format(image):
    """التحقق من تنسيق الصورة"""
    allowed_formats = ['JPEG', 'PNG', 'WebP']
    if image.format not in allowed_formats:
        raise ValidationError('تنسيق الصورة غير مدعوم')

def validate_arabic_text(value):
    """التحقق من النص العربي"""
    if not re.search(r'[\u0600-\u06FF]', value):
        raise ValidationError('يجب أن يحتوي النص على أحرف عربية')

def validate_price(value):
    """التحقق من السعر"""
    if value <= 0:
        raise ValidationError('السعر يجب أن يكون أكبر من صفر')
    
    if value > 1000000:
        raise ValidationError('السعر مرتفع جداً')

# مُحقق رقم الهاتف المصري
egyptian_phone_validator = RegexValidator(
    regex=r'^(\+20|0)?1[0125]\d{8}$',
    message='رقم الهاتف المصري غير صحيح'
)

# مُحقق الرقم القومي المصري
egyptian_national_id_validator = RegexValidator(
    regex=r'^\d{14}$',
    message='الرقم القومي يجب أن يكون 14 رقم'
)