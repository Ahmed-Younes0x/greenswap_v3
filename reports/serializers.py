from rest_framework import serializers
from .models import Report, ReportAction
from accounts.serializers import UserPublicSerializer

class ReportSerializer(serializers.ModelSerializer):
    reporter = UserPublicSerializer(read_only=True)
    reviewed_by = UserPublicSerializer(read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    evidence_image_url = serializers.SerializerMethodField()
    evidence_file_url = serializers.SerializerMethodField()
    can_review = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = ['id', 'reporter', 'report_type', 'report_type_display', 'title', 'description',
                 'status', 'status_display', 'priority', 'priority_display', 'evidence_image',
                 'evidence_image_url', 'evidence_file', 'evidence_file_url', 'admin_response',
                 'reviewed_by', 'created_at', 'updated_at', 'reviewed_at', 'resolved_at', 'can_review']
        read_only_fields = ['id', 'reporter', 'reviewed_by', 'created_at', 'updated_at', 'reviewed_at', 'resolved_at']

    def get_evidence_image_url(self, obj):
        if obj.evidence_image:
            return self.context['request'].build_absolute_uri(obj.evidence_image.url)
        return None

    def get_evidence_file_url(self, obj):
        if obj.evidence_file:
            return self.context['request'].build_absolute_uri(obj.evidence_file.url)
        return None

    def get_can_review(self, obj):
        request = self.context.get('request')
        return request and request.user.is_staff and obj.status == 'pending'

class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['report_type', 'title', 'description', 'content_type', 'object_id', 
                 'evidence_image', 'evidence_file']

class ReportActionSerializer(serializers.ModelSerializer):
    taken_by = UserPublicSerializer(read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)

    class Meta:
        model = ReportAction
        fields = ['id', 'action_type', 'action_type_display', 'description', 'taken_by', 'created_at']
        read_only_fields = ['id', 'taken_by', 'created_at']