# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from accounts.models import User
from .models import ChatRoom, Message, UserPresence, MessageRead
from django.utils import timezone
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            await self.close()
            return
        
        self.room_slug = self.scope['url_route']['kwargs']['room_slug']
        self.room_group_name = f'chat_{self.room_slug}'
        
        # Check if user has access to this room
        has_access = await self.check_room_access()
        if not has_access:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Update user presence
        await self.update_user_presence(True)
        
        # Notify others that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status_update',
                'user_id': self.user.id,
                'username': self.user.username,
                'status': 'online',
                'message': f'{self.user.username} joined the chat'
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            # Update user presence
            await self.update_user_presence(False)
            
            # Notify others that user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status_update',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'status': 'offline',
                    'message': f'{self.user.username} left the chat'
                }
            )
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'message')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'mark_read':
                await self.handle_mark_read(data)
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

    async def handle_chat_message(self, data):
        content = data.get('content', '').strip()
        reply_to_id = data.get('reply_to')
        
        if not content:
            return
        
        # Save message to database
        message = await self.save_message(content, reply_to_id)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': str(message.id),
                    'content': message.content,
                    'sender': {
                        'id': message.sender.id,
                        'username': message.sender.username,
                        'first_name': message.sender.first_name,
                        'last_name': message.sender.last_name,
                    },
                    'timestamp': message.timestamp.isoformat(),
                    'message_type': message.message_type,
                    'reply_to': {
                        'id': str(message.reply_to.id),
                        'content': message.reply_to.content[:100],
                        'sender': message.reply_to.sender.username
                    } if message.reply_to else None
                }
            }
        )

    async def handle_typing(self, data):
        is_typing = data.get('is_typing', False)
        
        # Send typing indicator to room group (except sender)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': is_typing
            }
        )

    async def handle_mark_read(self, data):
        message_ids = data.get('message_ids', [])
        await self.mark_messages_read(message_ids)

    # WebSocket message handlers
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def typing_indicator(self, event):
        # Don't send typing indicator to the sender
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing']
            }))

    async def user_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status_update',
            'user_id': event['user_id'],
            'username': event['username'],
            'status': event['status'],
            'message': event['message']
        }))

    # Database operations
    @database_sync_to_async
    def check_room_access(self):
        try:
            room = ChatRoom.objects.get(slug=self.room_slug)
            if room.room_type == 'public':
                return True
            elif room.room_type in ['private', 'group']:
                return room.members.filter(id=self.user.id).exists()
            return False
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content, reply_to_id=None):
        room = ChatRoom.objects.get(slug=self.room_slug)
        reply_to = None
        
        if reply_to_id:
            try:
                reply_to = Message.objects.get(id=reply_to_id, room=room)
            except Message.DoesNotExist:
                pass
        
        message = Message.objects.create(
            room=room,
            sender=self.user,
            content=content,
            reply_to=reply_to
        )
        
        # Update room's updated_at
        room.updated_at = timezone.now()
        room.save()
        
        return message

    @database_sync_to_async
    def update_user_presence(self, is_online):
        room = ChatRoom.objects.get(slug=self.room_slug)
        presence, created = UserPresence.objects.get_or_create(
            user=self.user,
            defaults={
                'is_online': is_online,
                'current_room': room if is_online else None
            }
        )
        
        if not created:
            presence.is_online = is_online
            presence.last_seen = timezone.now()
            presence.current_room = room if is_online else None
            presence.save()

    @database_sync_to_async
    def mark_messages_read(self, message_ids):
        room = ChatRoom.objects.get(slug=self.room_slug)
        messages = Message.objects.filter(id__in=message_ids, room=room)
        
        for message in messages:
            MessageRead.objects.get_or_create(
                user=self.user,
                message=message
            )




# # chat/consumers.py

# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from accounts.models import User
# from .models import ChatRoom, Message, OnlineUser
# from django.utils import timezone

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = f'chat_{self.room_name}'
#         self.user = self.scope['user']
        
#         # Join room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
        
#         await self.accept()
        
#         # Add user to online users
#         await self.add_online_user()
        
#         # Notify room about new user
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'user_joined',
#                 'message': f'{self.user.username} joined the chat',
#                 'user': self.user.username
#             }
#         )

#     async def disconnect(self, close_code):
#         # Remove user from online users
#         await self.remove_online_user()
        
#         # Notify room about user leaving
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'user_left',
#                 'message': f'{self.user.username} left the chat',
#                 'user': self.user.username
#             }
#         )
        
#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message_type = data.get('type', 'message')
        
#         if message_type == 'message':
#             message = data['message']
            
#             # Save message to database
#             await self.save_message(message)
            
#             # Send message to room group
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'message': message,
#                     'user': self.user.username,
#                     'timestamp': timezone.now().isoformat()
#                 }
#             )
#         elif message_type == 'typing':
#             # Handle typing indicator
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'typing_indicator',
#                     'user': self.user.username,
#                     'is_typing': data.get('is_typing', False)
#                 }
#             )

#     async def chat_message(self, event):
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'type': 'message',
#             'message': event['message'],
#             'user': event['user'],
#             'timestamp': event['timestamp']
#         }))

#     async def user_joined(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'user_joined',
#             'message': event['message'],
#             'user': event['user']
#         }))

#     async def user_left(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'user_left',
#             'message': event['message'],
#             'user': event['user']
#         }))

#     async def typing_indicator(self, event):
#         # Don't send typing indicator to the user who is typing
#         if event['user'] != self.user.username:
#             await self.send(text_data=json.dumps({
#                 'type': 'typing',
#                 'user': event['user'],
#                 'is_typing': event['is_typing']
#             }))

#     @database_sync_to_async
#     def save_message(self, message):
#         room = ChatRoom.objects.get(name=self.room_name)
#         Message.objects.create(
#             room=room,
#             user=self.user,
#             content=message
#         )

#     @database_sync_to_async
#     def add_online_user(self):
#         room = ChatRoom.objects.get(name=self.room_name)
#         OnlineUser.objects.update_or_create(
#             user=self.user,
#             defaults={'room': room, 'last_seen': timezone.now()}
#         )

#     @database_sync_to_async
#     def remove_online_user(self):
#         OnlineUser.objects.filter(user=self.user).delete()