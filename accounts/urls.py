from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, UserLoginView, logout_view, CurrentUserView,
    UserProfileUpdateView, UserProfileSettingsView, UserPublicProfileView,
    UserRatingListCreateView, user_stats, change_password , verf , ResetPassword
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('verf/', verf, name='user-logout'),
    path('logout/', logout_view, name='user-logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('current-user/', CurrentUserView.as_view(), name='current-user'),
    path('profile/', UserProfileUpdateView.as_view(), name='profile-update'),
    path('profile/settings/', UserProfileSettingsView.as_view(), name='profile-settings'),
    path('public/<int:pk>/', UserPublicProfileView.as_view(), name='user-public'),
    path('users/<int:user_id>/ratings/', UserRatingListCreateView.as_view(), name='user-ratings'),
    path('stats/', user_stats, name='user-stats'),
    path('reset-password/', ResetPassword.as_view(), name='reset-password'),

    path('change-password/', change_password, name='change-password'),
]