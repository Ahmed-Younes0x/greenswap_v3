from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework import status

def api_root(request):
    """API Root endpoint"""
    return JsonResponse({
        'message': 'مرحباً بك في GreenSwap Egypt API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'items': '/api/items/',
            'orders': '/api/orders/',
            'chat': '/api/chat/',
            'notifications': '/api/notifications/',
            'ai': '/api/ai/',
            'dashboard': '/api/dashboard/',
            'reports': '/api/reports/',
        }
    })

def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'GreenSwap Egypt API is running'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('health/', health_check, name='health-check'),
    path('api/auth/', include('accounts.urls')),
    path('media/', include('images.urls')),
    path('api/items/', include('items.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/ai/', include('ai_services.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/reports/', include('reports.urls')),
]

if settings.DEBUG:
    # urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Custom error handlers
handler404 = 'greenswap_backend.views.handler404'
handler500 = 'greenswap_backend.views.handler500'