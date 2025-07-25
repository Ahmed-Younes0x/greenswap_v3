from django.urls import path
from .views import (
    CategoryListView, ItemListView, ItemCreateView, ItemDetailView,
    ItemUpdateView, ItemDeleteView, MyItemsView, FeaturedItemsView,
    ItemRatingListCreateView, toggle_like, item_stats, popular_items,
    recent_items, recommended_items
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', ItemListView.as_view(), name='item-list'),
    path('create/', ItemCreateView.as_view(), name='item-create'),
    path('<int:pk>/', ItemDetailView.as_view(), name='item-detail'),
    path('<int:pk>/update/', ItemUpdateView.as_view(), name='item-update'),
    path('<int:pk>/delete/', ItemDeleteView.as_view(), name='item-delete'),
    path('my-items/', MyItemsView.as_view(), name='my-items'),
    path('featured/', FeaturedItemsView.as_view(), name='featured-items'),
    path('<int:item_id>/ratings/', ItemRatingListCreateView.as_view(), name='item-ratings'),
    path('<int:item_id>/toggle-like/', toggle_like, name='toggle-like'),
    path('stats/', item_stats, name='item-stats'),
    path('popular/', popular_items, name='popular-items'),
    path('recent/', recent_items, name='recent-items'),
    path('recommended/', recommended_items, name='recommended-items'),
]