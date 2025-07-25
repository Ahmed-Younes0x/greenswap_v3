from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, UserRating

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'user_type', 'is_verified', 'is_active', 'date_joined']
    list_filter = ['user_type', 'is_verified', 'is_active', 'date_joined']
    search_fields = ['email', 'full_name', 'business_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'phone', 'avatar', 'bio', 'location')}),
        ('Business info', {'fields': ('business_name', 'business_license', 'business_address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Statistics', {'fields': ('total_items_posted', 'total_orders_made', 'rating_average', 'rating_count')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'user_type', 'password1', 'password2'),
        }),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'preferred_language', 'dark_mode', 'email_notifications', 'push_notifications']
    list_filter = ['preferred_language', 'dark_mode', 'email_notifications', 'push_notifications']
    search_fields = ['user__email', 'user__full_name']

@admin.register(UserRating)
class UserRatingAdmin(admin.ModelAdmin):
    list_display = ['rater', 'rated_user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['rater__email', 'rated_user__email']