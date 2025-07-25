import django_filters
from django.db import models
from .models import Item, Category

class ItemFilter(django_filters.FilterSet):
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all())
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    condition = django_filters.MultipleChoiceFilter(choices=Item.CONDITION_CHOICES)
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    is_negotiable = django_filters.BooleanFilter()
    is_urgent = django_filters.BooleanFilter()
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Item
        fields = ['category', 'min_price', 'max_price', 'condition', 'location', 
                 'is_negotiable', 'is_urgent', 'created_after', 'created_before']