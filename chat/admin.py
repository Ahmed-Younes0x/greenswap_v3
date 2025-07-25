from django.contrib import admin
from .models import Conversation, Message, MessageRead

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ['sender', 'message_type', 'content', 'is_read', 'is_deleted', 'created_at']

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation_type', 'title', 'is_active', 'created_at', 'last_message_at']
    list_filter = ['conversation_type', 'is_active', 'is_archived', 'created_at']
    search_fields = ['title', 'participants__full_name']
    filter_horizontal = ['participants']
    readonly_fields = ['created_at', 'updated_at', 'last_message_at']
    inlines = [MessageInline]
    
    fieldsets = (
        (None, {
            'fields': ('conversation_type', 'title', 'participants')
        }),
        ('Related Objects', {
            'fields': ('related_item', 'related_order')
        }),
        ('Status', {
            'fields': ('is_active', 'is_archived')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_message_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'message_type', 'content_preview', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read', 'is_deleted', 'created_at']
    search_fields = ['content', 'sender__full_name', 'conversation__title']
    readonly_fields = ['created_at', 'updated_at', 'read_at']
    
    fieldsets = (
        (None, {
            'fields': ('conversation', 'sender', 'message_type', 'content')
        }),
        ('Media', {
            'fields': ('image', 'file', 'latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_read', 'is_edited', 'is_deleted', 'reply_to')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'read_at'),
            'classes': ('collapse',)
        })
    )
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'محتوى الرسالة'

@admin.register(MessageRead)
class MessageReadAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'read_at']
    list_filter = ['read_at']
    search_fields = ['message__content', 'user__full_name']