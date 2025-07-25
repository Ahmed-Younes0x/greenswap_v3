from django.contrib import admin
from .models import AIAnalysis, ChatBot, ChatBotMessage, AIModel

@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'analysis_type', 'status', 'confidence_score', 'processing_time', 'created_at']
    list_filter = ['analysis_type', 'status', 'created_at']
    search_fields = ['user__full_name', 'input_text']
    readonly_fields = ['created_at', 'started_at', 'completed_at', 'processing_time']
    
    fieldsets = (
        (None, {
            'fields': ('user', 'analysis_type', 'status', 'related_item')
        }),
        ('Input Data', {
            'fields': ('input_text', 'input_image', 'input_data')
        }),
        ('Results', {
            'fields': ('result_data', 'confidence_score', 'error_message')
        }),
        ('Processing Info', {
            'fields': ('processing_time', 'created_at', 'started_at', 'completed_at'),
            'classes': ('collapse',)
        })
    )

class ChatBotMessageInline(admin.TabularInline):
    model = ChatBotMessage
    extra = 0
    readonly_fields = ['created_at']

@admin.register(ChatBot)
class ChatBotAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'session_type', 'is_active', 'created_at', 'last_activity']
    list_filter = ['session_type', 'is_active', 'created_at']
    search_fields = ['session_id', 'user__full_name']
    readonly_fields = ['session_id', 'created_at', 'last_activity']
    inlines = [ChatBotMessageInline]

@admin.register(ChatBotMessage)
class ChatBotMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'message_type', 'content_preview', 'processing_time', 'created_at']
    list_filter = ['message_type', 'created_at']
    search_fields = ['content', 'session__session_id']
    readonly_fields = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'محتوى الرسالة'

@admin.register(AIModel)
class AIModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'model_type', 'version', 'is_active', 'is_default', 'accuracy', 'total_requests']
    list_filter = ['model_type', 'is_active', 'is_default']
    search_fields = ['name', 'version']
    readonly_fields = ['total_requests', 'successful_requests', 'created_at', 'updated_at', 'last_used']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'model_type', 'version', 'config')
        }),
        ('Status', {
            'fields': ('is_active', 'is_default')
        }),
        ('Performance', {
            'fields': ('accuracy', 'avg_processing_time', 'total_requests', 'successful_requests'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_used'),
            'classes': ('collapse',)
        })
    )