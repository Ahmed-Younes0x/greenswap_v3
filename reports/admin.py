from django.contrib import admin
from .models import Report, ReportAction

class ReportActionInline(admin.TabularInline):
    model = ReportAction
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'reporter', 'report_type', 'status', 'priority', 'created_at']
    list_filter = ['report_type', 'status', 'priority', 'created_at']
    search_fields = ['title', 'description', 'reporter__full_name']
    readonly_fields = ['created_at', 'updated_at', 'reviewed_at', 'resolved_at']
    inlines = [ReportActionInline]
    
    fieldsets = (
        (None, {
            'fields': ('reporter', 'report_type', 'title', 'description')
        }),
        ('الأدلة', {
            'fields': ('evidence_image', 'evidence_file')
        }),
        ('الحالة والأولوية', {
            'fields': ('status', 'priority')
        }),
        ('رد الإدارة', {
            'fields': ('admin_response', 'reviewed_by')
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at', 'reviewed_at', 'resolved_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(ReportAction)
class ReportActionAdmin(admin.ModelAdmin):
    list_display = ['report', 'action_type', 'taken_by', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['report__title', 'description', 'taken_by__full_name']
    readonly_fields = ['created_at']