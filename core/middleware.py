import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(MiddlewareMixin):
    """تسجيل الطلبات"""
    
    def process_request(self, request):
        request.start_time = time.time()
        
        # تسجيل معلومات الطلب
        logger.info(f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR')}")
        
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(f"Response: {response.status_code} in {duration:.2f}s")
        
        return response

class ErrorHandlingMiddleware(MiddlewareMixin):
    """معالجة الأخطاء"""
    
    def process_exception(self, request, exception):
        logger.error(f"Exception in {request.path}: {str(exception)}", exc_info=True)
        
        if settings.DEBUG:
            return None
        
        return JsonResponse({
            'success': False,
            'message': 'حدث خطأ في الخادم',
            'status_code': 500
        }, status=500)

class CORSMiddleware(MiddlewareMixin):
    """معالجة CORS"""
    
    def process_response(self, request, response):
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response