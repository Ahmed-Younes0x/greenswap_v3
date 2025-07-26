from django.contrib import admin
from .models import Category, Item, ItemImage, ItemRating, ItemLike, ItemView

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name_ar', 'name_en', 'parent', 'is_active', 'sort_order']
    list_filter = ['is_active', 'parent']
    search_fields = ['name_ar', 'name_en']
    ordering = ['sort_order', 'name_ar']

class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 1

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'price', 'condition', 'status', 'is_featured', 'created_at']
    list_filter = ['status', 'condition', 'category', 'is_featured', 'is_urgent', 'created_at']
    search_fields = ['title', 'description', 'owner__full_name', 'owner__email']
    readonly_fields = ['views_count', 'likes_count', 'rating_average', 'rating_count']
    inlines = [ItemImageInline]
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'category', 'owner', 'thumbnail')
        }),
        ('Pricing & Quantity', {
            'fields': ('price', 'quantity', 'is_negotiable')
        }),
        ('Details', {
            'fields': ('condition', 'weight', 'dimensions', 'material')
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Status', {
            'fields': ('status', 'is_featured', 'is_urgent')
        }),
        ('AI Analysis', {
            'fields': ('ai_analyzed', 'ai_category_suggestion', 'ai_condition_assessment', 'ai_price_suggestion'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('views_count', 'likes_count', 'rating_average', 'rating_count'),
            'classes': ('collapse',)
        })
    )

@admin.register(ItemRating)
class ItemRatingAdmin(admin.ModelAdmin):
    list_display = ['item', 'rater', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['item__title', 'rater__full_name']

@admin.register(ItemLike)
class ItemLikeAdmin(admin.ModelAdmin):
    list_display = ['item', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['item__title', 'user__full_name']

@admin.register(ItemView)
class ItemViewAdmin(admin.ModelAdmin):
    list_display = ['item', 'user', 'ip_address', 'created_at']
    list_filter = ['created_at']
    search_fields = ['item__title', 'user__full_name', 'ip_address']
