# notifications/consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from .models import Notification
from rest_framework_simplejwt.tokens import AccessToken

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        token = self.scope['query_string'].decode().split('token=')[-1]
        user = await self.get_user(token)
        if user is None:
            await self.close()
        else:
            self.user = user
            self.group_name = f'notifications_{self.user.id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        await self.send_json(event['content'])
    @database_sync_to_async
    def get_user(self, token):
        from accounts.models import User
        try:
            payload = AccessToken(token)
            return User.objects.get(id=payload['user_id'])
        except:
            return None
