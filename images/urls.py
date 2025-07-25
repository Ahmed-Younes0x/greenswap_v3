from django.urls import path
from .views import serve_image ,serve_avatar

urlpatterns = [
    path('items/<str:filename>/', serve_image, name='serve-image'),
    path('avatar/<str:filename>', serve_avatar, name='serve-image-itemid'),
    # path('avatar/<int:itemid>/', serve_image_avatar, name='serve-image-itemid'),
]
