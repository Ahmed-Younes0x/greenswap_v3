from django.http import JsonResponse
from rest_framework import status

def handler404(request, exception):
    """Custom 404 handler"""
    return JsonResponse({
        'error': 'الصفحة غير موجودة',
        'message': 'الرابط المطلوب غير موجود',
        'status_code': 404
    }, status=404)

def handler500(request):
    """Custom 500 handler"""
    return JsonResponse({
        'error': 'خطأ في الخادم',
        'message': 'حدث خطأ داخلي في الخادم',
        'status_code': 500
    }, status=500)