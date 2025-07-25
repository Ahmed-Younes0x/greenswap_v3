from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import SystemSettings
from .utils import FileUploadHandler, ResponseFormatter

User = get_user_model()

class SystemSettingsTestCase(TestCase):
    def test_get_setting(self):
        """اختبار الحصول على إعداد"""
        SystemSettings.objects.create(
            key='test_key',
            value='test_value',
            is_active=True
        )
        
        value = SystemSettings.get_setting('test_key')
        self.assertEqual(value, 'test_value')
        
        # اختبار القيمة الافتراضية
        default_value = SystemSettings.get_setting('non_existent', 'default')
        self.assertEqual(default_value, 'default')

    def test_set_setting(self):
        """اختبار تعيين إعداد"""
        setting = SystemSettings.set_setting('new_key', 'new_value', 'وصف')
        self.assertEqual(setting.key, 'new_key')
        self.assertEqual(setting.value, 'new_value')

class ResponseFormatterTestCase(TestCase):
    def test_success_response(self):
        """اختبار استجابة النجاح"""
        response = ResponseFormatter.success_response(
            data={'test': 'data'},
            message='نجح الاختبار'
        )
        
        self.assertTrue(response['success'])
        self.assertEqual(response['message'], 'نجح الاختبار')
        self.assertEqual(response['data']['test'], 'data')

    def test_error_response(self):
        """اختبار استجابة الخطأ"""
        response = ResponseFormatter.error_response(
            message='فشل الاختبار',
            status_code=400
        )
        
        self.assertFalse(response['success'])
        self.assertEqual(response['message'], 'فشل الاختبار')
        self.assertEqual(response['status_code'], 400)