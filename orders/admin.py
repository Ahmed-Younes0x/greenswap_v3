from django.contrib import admin
from .models import Order, OrderMessage, OrderTracking, OrderRating

class OrderMessageInline(admin.TabularInline):
    model = OrderMessage
    extra = 0
    readonly_fields = ['created_at']

class OrderTrackingInline(admin.TabularInline):
    model = OrderTracking
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'buyer', 'seller', 'item', 'status', 'total_price', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'buyer__full_name', 'seller__full_name', 'item__title']
    readonly_fields = ['order_number', 'total_price', 'created_at', 'updated_at']
    inlines = [OrderMessageInline, OrderTrackingInline]
    
    fieldsets = (
        (None, {
            'fields': ('order_number', 'buyer', 'seller', 'item')
        }),
        ('Order Details', {
            'fields': ('quantity', 'unit_price', 'total_price', 'status', 'payment_status')
        }),
        ('Delivery', {
            'fields': ('delivery_address', 'delivery_phone', 'delivery_notes')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at', 'accepted_at', 'completed_at', 'expected_delivery_date')
        }),
        ('Notes', {
            'fields': ('buyer_notes', 'seller_notes')
        })
    )

@admin.register(OrderRating)
class OrderRatingAdmin(admin.ModelAdmin):
    list_display = ['order', 'rater', 'rated_user', 'rating_type', 'rating', 'created_at']
    list_filter = ['rating_type', 'rating', 'created_at']
    search_fields = ['order__order_number', 'rater__full_name', 'rated_user__full_name']