from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Max
from .models import Conversation, Message, MessageRead
from .serializers import (
    ConversationSerializer, ConversationCreateSerializer,
    MessageSerializer, MessageCreateSerializer
)
from .permissions import IsConversationParticipant

class ConversationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        print("line 16, data:", self.request.data)
        if self.request.method == 'POST':
            return ConversationCreateSerializer
        return ConversationSerializer
    def create(self, request, *args, **kwargs):
        if Conversation.objects.filter(
            participants=request.user,
            related_order=request.data.get('related_order'),
        ).exists():
            return Response({'error': 'You already have an active conversation.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        print("line 22, user:", user)
        return Conversation.objects.filter(
            participants=user,
            is_active=True
        ).annotate(
            last_message_time=Max('messages__created_at')
        ).order_by('-last_message_time', '-updated_at')

class ConversationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsConversationParticipant]

    def get_queryset(self):
        print("line 34, user:", self.request.user)
        return Conversation.objects.filter(participants=self.request.user)

class ConversationMessagesView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsConversationParticipant]

    def get_serializer_class(self):
        print("line 42, method:", self.request.method)
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        print("line 48, conversation_id:", conversation_id)
        return Message.objects.filter(
            conversation_id=conversation_id,
            is_deleted=False
        ).order_by('created_at')

    def perform_create(self, serializer):
        print("line 56, raw data:", self.request.data)
        conversation_id = self.kwargs.get('conversation_id')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        print("line 59, conversation:", conversation)

        if not conversation.participants.filter(id=self.request.user.id).exists():
            raise permissions.PermissionDenied('ليس لديك صلاحية للكتابة في هذه المحادثة')

        message = serializer.save(
            conversation=conversation,
            sender=self.request.user
        )
        print("line 67, saved message:", message)

        conversation.last_message_at = message.created_at
        conversation.save()
        print("line 71, updated conversation:", conversation)

class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        print("line 78, user:", self.request.user)
        return Message.objects.filter(
            conversation__participants=self.request.user,
            is_deleted=False
        )

    def perform_update(self, serializer):
        message = self.get_object()
        print("line 86, message to update:", message)

        if message.sender != self.request.user:
            raise permissions.PermissionDenied('لا يمكنك تعديل رسائل الآخرين')

        from django.utils import timezone
        if (timezone.now() - message.created_at).total_seconds() > 900:
            raise permissions.PermissionDenied('لا يمكن تعديل الرسالة بعد 15 دقيقة من إرسالها')

        serializer.save(is_edited=True)
        print("line 94, message updated")

    def perform_destroy(self, instance):
        print("line 97, message to delete:", instance)
        if instance.sender != self.request.user:
            raise permissions.PermissionDenied('لا يمكنك حذف رسائل الآخرين')

        instance.is_deleted = True
        instance.content = 'تم حذف هذه الرسالة'
        instance.save()
        print("line 103, message logically deleted")

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_conversation_as_read(request, conversation_id):
    print("line 108, mark_conversation_as_read data:", request.data)
    conversation = get_object_or_404(Conversation, id=conversation_id)

    if not conversation.participants.filter(id=request.user.id).exists():
        return Response({'error': 'ليس لديك صلاحية للوصول لهذه المحادثة'}, 
                       status=status.HTTP_403_FORBIDDEN)

    unread_messages = conversation.messages.filter(
        is_read=False,
        is_deleted=False
    ).exclude(sender=request.user)

    unread_count = unread_messages.count()
    print("line 118, unread_count:", unread_count)
    unread_messages.update(is_read=True, read_at=timezone.now())

    return Response({
        'message': 'تم تحديد الرسائل كمقروءة',
        'marked_count': unread_count
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_message_as_read(request, message_id):
    print("line 129, mark_message_as_read data:", request.data)
    message = get_object_or_404(Message, id=message_id)

    if not message.conversation.participants.filter(id=request.user.id).exists():
        return Response({'error': 'ليس لديك صلاحية للوصول لهذه الرسالة'}, 
                       status=status.HTTP_403_FORBIDDEN)

    if not message.is_read and message.sender != request.user:
        message.mark_as_read(request.user)
        print("line 137, message marked as read")
        return Response({'message': 'تم تحديد الرسالة كمقروءة'})

    return Response({'message': 'الرسالة مقروءة بالفعل'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_search(request):
    print("line 145, search query:", request.GET.get('q', ''))
    query = request.GET.get('q', '')
    user = request.user

    if not query:
        return Response({'results': []})

    conversations = Conversation.objects.filter(
        participants=user,
        is_active=True
    ).filter(
        Q(title__icontains=query) |
        Q(messages__content__icontains=query) |
        Q(participants__full_name__icontains=query)
    ).distinct()

    serializer = ConversationSerializer(conversations, many=True, context={'request': request})
    print("line 160, search results:", serializer.data)
    return Response({'results': serializer.data})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_messages_count(request):
    user = request.user
    print("line 167, user:", user)

    unread_count = Message.objects.filter(
        conversation__participants=user,
        is_read=False,
        is_deleted=False
    ).exclude(sender=user).count()
    print("line 173, unread messages count:", unread_count)

    return Response({'unread_count': unread_count})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def archive_conversation(request, conversation_id):
    print("line 179, archive_conversation data:", request.data)
    conversation = get_object_or_404(Conversation, id=conversation_id)

    if not conversation.participants.filter(id=request.user.id).exists():
        return Response({'error': 'ليس لديك صلاحية للوصول لهذه المحادثة'}, 
                       status=status.HTTP_403_FORBIDDEN)

    conversation.is_archived = True
    conversation.save()
    print("line 187, conversation archived")

    return Response({'message': 'تم أرشفة المحادثة بنجاح'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chat_stats(request):
    user = request.user
    print("line 194, user:", user)

    total_conversations = Conversation.objects.filter(participants=user).count()
    active_conversations = Conversation.objects.filter(participants=user, is_active=True).count()
    archived_conversations = Conversation.objects.filter(participants=user, is_archived=True).count()

    total_messages_sent = Message.objects.filter(sender=user, is_deleted=False).count()
    total_messages_received = Message.objects.filter(
        conversation__participants=user,
        is_deleted=False
    ).exclude(sender=user).count()

    unread_messages = Message.objects.filter(
        conversation__participants=user,
        is_read=False,
        is_deleted=False
    ).exclude(sender=user).count()

    print("line 209, stats:", {
        'total_conversations': total_conversations,
        'active_conversations': active_conversations,
        'archived_conversations': archived_conversations,
        'total_messages_sent': total_messages_sent,
        'total_messages_received': total_messages_received,
        'unread_messages': unread_messages
    })

    return Response({
        'total_conversations': total_conversations,
        'active_conversations': active_conversations,
        'archived_conversations': archived_conversations,
        'total_messages_sent': total_messages_sent,
        'total_messages_received': total_messages_received,
        'unread_messages': unread_messages
    })
