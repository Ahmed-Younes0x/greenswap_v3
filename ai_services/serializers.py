from rest_framework import serializers
from .models import AIAnalysis, ChatBot, ChatBotMessage, AIModel

class AIAnalysisSerializer(serializers.ModelSerializer):
    analysis_type_display = serializers.CharField(source='get_analysis_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    input_image_url = serializers.SerializerMethodField()

    class Meta:
        model = AIAnalysis
        fields = ['id', 'analysis_type', 'analysis_type_display', 'status', 'status_display',
                 'input_text', 'input_image', 'input_image_url', 'input_data', 'result_data',
                 'confidence_score', 'processing_time', 'error_message', 'created_at',
                 'started_at', 'completed_at']
        read_only_fields = ['id', 'user', 'status', 'result_data', 'confidence_score',
                           'processing_time', 'error_message', 'created_at', 'started_at', 'completed_at']

    def get_input_image_url(self, obj):
        if obj.input_image:
            return self.context['request'].build_absolute_uri(obj.input_image.url)
        return None

class AIAnalysisCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = ['analysis_type', 'input_text', 'input_image', 'input_data', 'related_item']

class ChatBotMessageSerializer(serializers.ModelSerializer):
    message_type_display = serializers.CharField(source='get_message_type_display', read_only=True)

    class Meta:
        model = ChatBotMessage
        fields = ['id', 'message_type', 'message_type_display', 'content', 'metadata',
                 'processing_time', 'created_at']
        read_only_fields = ['id', 'processing_time', 'created_at']

class ChatBotSerializer(serializers.ModelSerializer):
    session_type_display = serializers.CharField(source='get_session_type_display', read_only=True)
    messages = ChatBotMessageSerializer(many=True, read_only=True)
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatBot
        fields = ['id', 'session_id', 'session_type', 'session_type_display', 'context_data',
                 'is_active', 'created_at', 'last_activity', 'messages', 'messages_count']
        read_only_fields = ['id', 'session_id', 'created_at', 'last_activity']

    def get_messages_count(self, obj):
        return obj.messages.count()

class ChatBotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBot
        fields = ['session_type', 'context_data']

class ChatBotMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBotMessage
        fields = ['content']

class AIModelSerializer(serializers.ModelSerializer):
    model_type_display = serializers.CharField(source='get_model_type_display', read_only=True)
    success_rate = serializers.SerializerMethodField()

    class Meta:
        model = AIModel
        fields = ['id', 'name', 'model_type', 'model_type_display', 'version', 'config',
                 'is_active', 'is_default', 'accuracy', 'avg_processing_time', 'total_requests',
                 'successful_requests', 'success_rate', 'created_at', 'updated_at', 'last_used']
        read_only_fields = ['id', 'total_requests', 'successful_requests', 'created_at',
                           'updated_at', 'last_used']

    def get_success_rate(self, obj):
        if obj.total_requests > 0:
            return (obj.successful_requests / obj.total_requests) * 100
        return 0

class AIStatsSerializer(serializers.Serializer):
    total_analyses = serializers.IntegerField()
    completed_analyses = serializers.IntegerField()
    failed_analyses = serializers.IntegerField()
    avg_processing_time = serializers.FloatField()
    analyses_by_type = serializers.DictField()
    recent_analyses_count = serializers.IntegerField()
    chatbot_sessions = serializers.IntegerField()
    active_chatbot_sessions = serializers.IntegerField()