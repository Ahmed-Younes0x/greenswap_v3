from django.urls import path
from .views import (
    OrderListView, OrderCreateView, OrderDetailView, OrderUpdateView,
    MyOrdersView, OrderMessagesView, OrderTrackingView, OrderRatingView,
    accept_order, reject_order, complete_order, cancel_order, order_stats
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/update/', OrderUpdateView.as_view(), name='order-update'),
    path('my-orders/', MyOrdersView.as_view(), name='my-orders'),
    path('<int:order_id>/messages/', OrderMessagesView.as_view(), name='order-messages'),
    path('<int:order_id>/tracking/', OrderTrackingView.as_view(), name='order-tracking'),
    path('<int:order_id>/rating/', OrderRatingView.as_view(), name='order-rating'),
    path('<int:order_id>/accept/', accept_order, name='accept-order'),
    path('<int:order_id>/reject/', reject_order, name='reject-order'),
    path('<int:order_id>/complete/', complete_order, name='complete-order'),
    path('<int:order_id>/cancel/', cancel_order, name='cancel-order'),
    path('stats/', order_stats, name='order-stats'),
]