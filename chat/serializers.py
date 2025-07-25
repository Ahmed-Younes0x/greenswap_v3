from rest_framework import serializers
from .models import Conversation, Message, MessageRead
from accounts.serializers import UserPublicSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)
    reply_to = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'message_type', 'content', 'image', 'image_url', 
                 'file', 'file_url', 'latitude', 'longitude', 'is_read', 'is_edited', 
                 'is_deleted', 'reply_to', 'created_at', 'updated_at', 'read_at',
                 'can_edit', 'can_delete']
        read_only_fields = ['id', 'sender', 'is_read', 'is_edited', 'created_at', 'updated_at', 'read_at']

    def get_reply_to(self, obj):
        if obj.reply_to:
            return {
                'id': obj.reply_to.id,
                'sender_name': obj.reply_to.sender.full_name,
                'content': obj.reply_to.content[:100] + '...' if len(obj.reply_to.content) > 100 else obj.reply_to.content,
                'message_type': obj.reply_to.message_type
            }
        return None

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    def get_file_url(self, obj):
        if obj.file:
            return self.context['request'].build_absolute_uri(obj.file.url)
        return None

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.sender:
            # يمكن تعديل الرسالة خلال 15 دقيقة من إرسالها
            from django.utils import timezone
            return (timezone.now() - obj.created_at).total_seconds() < 900
        return False

    def get_can_delete(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.sender

class MessageCreateSerializer(serializers.ModelSerializer):
    reply_to_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Message
        fields = ['message_type', 'content', 'image', 'file', 'latitude', 'longitude', 'reply_to_id']

    def validate_reply_to_id(self, value):
        if value:
            try:
                message = Message.objects.get(id=value)
                # التأكد من أن الرسالة المرد عليها في نفس المحادثة
                conversation_id = self.context.get('conversation_id')
                if message.conversation.id != conversation_id:
                    raise serializers.ValidationError('الرسالة المرد عليها ليست في نفس المحادثة')
                return value
            except Message.DoesNotExist:
                raise serializers.ValidationError('الرسالة المرد عليها غير موجودة')
        return value

    def create(self, validated_data):
        reply_to_id = validated_data.pop('reply_to_id', None)
        message = Message.objects.create(**validated_data)
        
        if reply_to_id:
            message.reply_to_id = reply_to_id
            message.save()
        
        return message

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserPublicSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'conversation_type', 'title', 'related_item', 
                 'related_order', 'is_active', 'is_archived', 'created_at', 'updated_at', 
                 'last_message_at', 'last_message', 'unread_count', 'other_participant']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_message_at']

    def get_last_message(self, obj):
        last_message = obj.messages.filter(is_deleted=False).last()
        if last_message:
            return {
                'id': last_message.id,
                'sender_name': last_message.sender.full_name,
                'content': last_message.content[:100] + '...' if len(last_message.content) > 100 else last_message.content,
                'message_type': last_message.message_type,
                'created_at': last_message.created_at
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False, is_deleted=False).exclude(sender=request.user).count()
        return 0

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.conversation_type == 'direct':
            other_user = obj.get_other_participant(request.user)
            if other_user:
                return UserPublicSerializer(other_user, context=self.context).data
        return None

class ConversationCreateSerializer(serializers.ModelSerializer):
    participant_id = serializers.IntegerField(write_only=True, required=False)
    # item_id = serializers.IntegerField(write_only=True, required=False)
    # order_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Conversation
        fields = ['conversation_type', 'title', 'participant_id', 'related_item', 'related_order']

    def validate(self, attrs):
        conversation_type = attrs.get('conversation_type')
        
        if conversation_type == 'direct' and not attrs.get('participant_id'):
            raise serializers.ValidationError('معرف المشارك مطلوب للمحادثات المباشرة')
        
        if conversation_type == 'order' and not attrs.get('order_id'):
            raise serializers.ValidationError('معرف الطلب مطلوب لمحادثات الطلبات')
        
        return attrs

    def create(self, validated_data):
        participant_id = validated_data.pop('participant_id', None)
        item_id = validated_data.pop('item_id', None)
        order_id = validated_data.pop('order_id', None)
        
        conversation = Conversation.objects.create(**validated_data)
        
        # إضافة المستخدم الحالي
        conversation.participants.add(self.context['request'].user)
        
        # إضافة المشارك الآخر
        if participant_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                participant = User.objects.get(id=participant_id)
                conversation.participants.add(participant)
            except User.DoesNotExist:
                pass
        
        # ربط المنتج أو الطلب
        if item_id:
            from items.models import Item
            try:
                conversation.related_item = Item.objects.get(id=item_id)
                conversation.save()
            except Item.DoesNotExist:
                pass
        
        if order_id:
            from orders.models import Order
            try:
                conversation.related_order = Order.objects.get(id=order_id)
                conversation.save()
            except Order.DoesNotExist:
                pass
        
        return conversation