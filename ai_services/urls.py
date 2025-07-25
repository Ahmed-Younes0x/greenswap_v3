from django.urls import path
from .views import (
    AIAnalysisListCreateView, AIAnalysisDetailView, ChatBotSessionListCreateView,
    ChatBotSessionDetailView, ChatBotMessageListCreateView, analyze_image,
    analyze_text, suggest_price, moderate_content, ai_stats, ai_models,
    close_chatbot_session, ai_capabilities, classify_waste_image
)

urlpatterns = [
    path('analyses/', AIAnalysisListCreateView.as_view(), name='ai-analysis-list'),
    path('analyses/<int:pk>/', AIAnalysisDetailView.as_view(), name='ai-analysis-detail'),
    path('chatbot/sessions/', ChatBotSessionListCreateView.as_view(), name='chatbot-session-list'),
    path('chatbot/sessions/<int:pk>/', ChatBotSessionDetailView.as_view(), name='chatbot-session-detail'),
    path('chatbot/sessions/<str:session_id>/messages/', ChatBotMessageListCreateView.as_view(), name='chatbot-messages'),
    path('chatbot/sessions/<str:session_id>/close/', close_chatbot_session, name='close-chatbot-session'),
    path('classify-waste/', classify_waste_image, name='classify-waste-image'),
    path('analyze-image/', analyze_image, name='analyze-image'),
    path('analyze-text/', analyze_text, name='analyze-text'),
    path('suggest-price/', suggest_price, name='suggest-price'),
    path('moderate-content/', moderate_content, name='moderate-content'),
    path('stats/', ai_stats, name='ai-stats'),
    path('models/', ai_models, name='ai-models'),
    path('capabilities/', ai_capabilities, name='ai-capabilities'),
]