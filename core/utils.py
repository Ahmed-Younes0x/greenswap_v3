import os
import uuid
from django.utils.text import slugify
from django.core.files.storage import default_storage
from PIL import Image
import io

def generate_unique_filename(instance, filename):
    """توليد اسم ملف فريد"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return filename

def compress_image(image, quality=85, max_size=(1920, 1080)):
    """ضغط الصورة وتحسين الحجم"""
    if image.size > (max_size[0], max_size[1]):
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    image.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    return output

def validate_file_size(file, max_size_mb=5):
    """التحقق من حجم الملف"""
    if file.size > max_size_mb * 1024 * 1024:
        raise ValueError(f'حجم الملف يجب أن يكون أقل من {max_size_mb} ميجابايت')

def get_client_ip(request):
    """الحصول على IP العميل"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def create_slug(text):
    """إنشاء slug من النص العربي"""
    return slugify(text, allow_unicode=True)

class FileUploadHandler:
    """معالج رفع الملفات"""
    
    @staticmethod
    def handle_image_upload(image_file, folder='uploads'):
        """معالجة رفع الصور"""
        try:
            # التحقق من نوع الملف
            allowed_types = ['image/jpeg', 'image/png', 'image/webp']
            if image_file.content_type not in allowed_types:
                raise ValueError('نوع الملف غير مدعوم')
            
            # التحقق من الحجم
            validate_file_size(image_file)
            
            # ضغط الصورة
            image = Image.open(image_file)
            compressed_image = compress_image(image)
            
            # حفظ الملف
            filename = generate_unique_filename(None, image_file.name)
            file_path = f"{folder}/{filename}"
            
            saved_path = default_storage.save(file_path, compressed_image)
            return saved_path
            
        except Exception as e:
            raise ValueError(f'خطأ في رفع الصورة: {str(e)}')

class ResponseFormatter:
    """منسق الاستجابات"""
    
    @staticmethod
    def success_response(data=None, message="تم بنجاح", status_code=200):
        """استجابة نجاح"""
        response = {
            'success': True,
            'message': message,
            'status_code': status_code
        }
        if data is not None:
            response['data'] = data
        return response
    
    @staticmethod
    def error_response(message="حدث خطأ", errors=None, status_code=400):
        """استجابة خطأ"""
        response = {
            'success': False,
            'message': message,
            'status_code': status_code
        }
        if errors:
            response['errors'] = errors
        return response

class PaginationHelper:
    """مساعد التصفح"""
    
    @staticmethod
    def get_paginated_response(paginator, page_obj, serializer_class, context=None):
        """الحصول على استجابة مقسمة"""
        serializer = serializer_class(page_obj, many=True, context=context)
        
        return {
            'results': serializer.data,
            'pagination': {
                'count': paginator.count,
                'num_pages': paginator.num_pages,
                'current_page': page_obj.number,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'next_page': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous_page': page_obj.previous_page_number() if page_obj.has_previous() else None,
            }
        }