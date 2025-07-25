import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope['user']
        
        # التحقق من صلاحية المستخدم للوصول للمحادثة
        if not await self.is_participant():
            await self.close()
            return
        
        # الانضمام لمجموعة المحادثة
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # إرسال إشعار بالاتصال
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'online'
            }
        )

    async def disconnect(self, close_code):
        # إرسال إشعار بقطع الاتصال
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'offline'
            }
        )
        
        # مغادرة مجموعة المحادثة
        await self.channel_layer.group_discard(
            self.conversation_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(text_data_json)
            elif message_type == 'typing':
                await self.handle_typing(text_data_json)
            elif message_type == 'mark_read':
                await self.handle_mark_read(text_data_json)
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))

    async def handle_chat_message(self, data):
        content = data.get('content', '')
        reply_to_id = data.get('reply_to_id')
        
        if not content.strip():
            return
        
        # حفظ الرسالة في قاعدة البيانات
        message = await self.save_message(content, reply_to_id)
        
        if message:
            # إرسال الرسالة لجميع المشاركين
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'chat_message',
                    'message': await self.serialize_message(message)
                }
            )

    async def handle_typing(self, data):
        is_typing = data.get('is_typing', False)
        
        # إرسال إشعار الكتابة لجميع المشاركين عدا المرسل
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'typing_status',
                'user_id': self.user.id,
                'user_name': self.user.full_name,
                'is_typing': is_typing
            }
        )

    async def handle_mark_read(self, data):
        message_id = data.get('message_id')
        
        if message_id:
            await self.mark_message_read(message_id)
            
            # إرسال إشعار القراءة
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'message_read',
                    'message_id': message_id,
                    'user_id': self.user.id
                }
            )

    # معالجات الرسائل الواردة من المجموعة
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def typing_status(self, event):
        # عدم إرسال إشعار الكتابة للمرسل نفسه
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_status',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }))

    async def user_status(self, event):
        # عدم إرسال إشعار الحالة للمستخدم نفسه
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': event['user_id'],
                'status': event['status']
            }))

    async def message_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message_read',
            'message_id': event['message_id'],
            'user_id': event['user_id']
        }))

    # دوال مساعدة
    @database_sync_to_async
    def is_participant(self):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content, reply_to_id=None):
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content,
                reply_to_id=reply_to_id
            )
            
            return message
        except Exception:
            return None

    @database_sync_to_async
    def serialize_message(self, message):
        from django.http import HttpRequest
        request = HttpRequest()
        request.user = self.user
        
        serializer = MessageSerializer(message, context={'request': request})
        return serializer.data

    @database_sync_to_async
    def mark_message_read(self, message_id):
        try:
            message = Message.objects.get(
                id=message_id,
                conversation_id=self.conversation_id
            )
            if message.sender != self.user:
                message.mark_as_read(self.user)
        except Message.DoesNotExist:
            pass

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.notification_group_name = f'notifications_{self.user.id}'
        
        # الانضمام لمجموعة الإشعارات
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # مغادرة مجموعة الإشعارات
        await self.channel_layer.group_discard(
            self.notification_group_name,
            self.channel_name
        )

    async def notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))