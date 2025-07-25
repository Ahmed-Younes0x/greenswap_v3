from django.urls import path
from .views import (
    ConversationListCreateView, ConversationDetailView, ConversationMessagesView,
    MessageDetailView, mark_conversation_as_read, mark_message_as_read,
    conversation_search, unread_messages_count, archive_conversation, chat_stats
)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', ConversationMessagesView.as_view(), name='conversation-messages'),
    path('messages/<int:pk>/', MessageDetailView.as_view(), name='message-detail'),
    path('conversations/<int:conversation_id>/mark-read/', mark_conversation_as_read, name='mark-conversation-read'),
    path('messages/<int:message_id>/mark-read/', mark_message_as_read, name='mark-message-read'),
    path('conversations/search/', conversation_search, name='conversation-search'),
    path('unread-count/', unread_messages_count, name='unread-messages-count'),
    path('conversations/<int:conversation_id>/archive/', archive_conversation, name='archive-conversation'),
    path('stats/', chat_stats, name='chat-stats'),
]