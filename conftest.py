import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from items.models import Category, Item

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        full_name='Test User'
    )

@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def category():
    return Category.objects.create(
        name_ar='اختبار',
        name_en='Test',
        description_ar='فئة اختبار',
        description_en='Test category'
    )

@pytest.fixture
def item(user, category):
    return Item.objects.create(
        title='منتج اختبار',
        description='وصف المنتج',
        category=category,
        owner=user,
        price=100.00,
        location='القاهرة'
    )