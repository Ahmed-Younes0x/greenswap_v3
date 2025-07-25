from django.urls import path
from .views import (
    NotificationListView, NotificationDetailView, NotificationSettingsView,
    mark_notification_read, mark_all_notifications_read, delete_notification,
    clear_all_notifications, notification_stats, unread_notifications_count,
    test_notification, notification_types
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('settings/', NotificationSettingsView.as_view(), name='notification-settings'),
    path('<int:notification_id>/mark-read/', mark_notification_read, name='mark-notification-read'),
    path('mark-all-read/', mark_all_notifications_read, name='mark-all-notifications-read'),
    path('<int:notification_id>/delete/', delete_notification, name='delete-notification'),
    path('clear-all/', clear_all_notifications, name='clear-all-notifications'),
    path('stats/', notification_stats, name='notification-stats'),
    path('unread-count/', unread_notifications_count, name='unread-notifications-count'),
    path('test/', test_notification, name='test-notification'),
    path('types/', notification_types, name='notification-types'),
]