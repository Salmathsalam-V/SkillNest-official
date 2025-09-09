# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from accounts.models import User
from .models import ChatRoom, Message, OnlineUser
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.user = self.scope['user']
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Add user to online users
        await self.add_online_user()
        
        # Notify room about new user
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'message': f'{self.user.username} joined the chat',
                'user': self.user.username
            }
        )

    async def disconnect(self, close_code):
        # Remove user from online users
        await self.remove_online_user()
        
        # Notify room about user leaving
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_left',
                'message': f'{self.user.username} left the chat',
                'user': self.user.username
            }
        )
        
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'message')
        
        if message_type == 'message':
            message = data['message']
            
            # Save message to database
            await self.save_message(message)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': self.user.username,
                    'timestamp': timezone.now().isoformat()
                }
            )
        elif message_type == 'typing':
            # Handle typing indicator
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user': self.user.username,
                    'is_typing': data.get('is_typing', False)
                }
            )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'user': event['user'],
            'timestamp': event['timestamp']
        }))

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'message': event['message'],
            'user': event['user']
        }))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'message': event['message'],
            'user': event['user']
        }))

    async def typing_indicator(self, event):
        # Don't send typing indicator to the user who is typing
        if event['user'] != self.user.username:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user': event['user'],
                'is_typing': event['is_typing']
            }))

    @database_sync_to_async
    def save_message(self, message):
        room = ChatRoom.objects.get(name=self.room_name)
        Message.objects.create(
            room=room,
            user=self.user,
            content=message
        )

    @database_sync_to_async
    def add_online_user(self):
        room = ChatRoom.objects.get(name=self.room_name)
        OnlineUser.objects.update_or_create(
            user=self.user,
            defaults={'room': room, 'last_seen': timezone.now()}
        )

    @database_sync_to_async
    def remove_online_user(self):
        OnlineUser.objects.filter(user=self.user).delete()