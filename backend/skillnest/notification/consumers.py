# your_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
import logging
logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        # Reject connection if user is not authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        # Create a unique group for this user
        self.group_name = f'notifications_{self.user.id}'
        # Join the user's notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send a welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to notifications'
        }))

    async def disconnect(self, close_code):
        # Leave the group
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # Handle incoming WebSocket messages (optional)
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', '')
        
        if message_type == 'ping':
            await self.send(text_data=json.dumps({
                'type': 'pong',
                'message': 'Connection alive'
            }))

    # Handle notification messages sent from Django views
    async def send_notification(self, event):
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
        'id': event["content"]["id"],
        'sender': event["content"]["sender"],
        'type': event["content"]["type"],
        'post_id': event["content"]["post_id"],
        'timestamp': event["content"]["created_at"],
    }))
