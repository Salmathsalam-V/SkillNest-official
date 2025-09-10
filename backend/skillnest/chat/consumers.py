# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from accounts.models import User
from .models import ChatRoom, Message, UserPresence

class CommunityChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        # Get room_slug from URL
        self.room_slug = self.scope['url_route']['kwargs']['room_slug']
        self.room_group_name = f'community_{self.room_slug}'

        # Check if this is a valid community room
        has_access = await self.check_room_access()
        if not has_access:
            await self.close()
            return

        # Add this channel to the group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Mark user as online in this community
        await self.update_user_presence(True)

        # Notify others
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status_update",
                "user_id": self.user.id,
                "username": self.user.username,
                "status": "online",
                "message": f"{self.user.username} joined the community chat"
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.update_user_presence(False)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_status_update",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "status": "offline",
                    "message": f"{self.user.username} left the community chat"
                }
            )

            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "chat_message":
            await self.handle_chat_message(data)
        elif message_type == "typing":
            await self.handle_typing(data)

    async def handle_chat_message(self, data):
        content = data.get("content", "").strip()
        if not content:
            return

        message = await self.save_message(content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": str(message.id),
                    "content": message.content,
                    "sender": {
                        "id": message.sender.id,
                        "username": message.sender.username,
                    },
                    "timestamp": message.timestamp.isoformat(),
                }
            }
        )

    async def handle_typing(self, data):
        is_typing = data.get("is_typing", False)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "typing_indicator",
                "user_id": self.user.id,
                "username": self.user.username,
                "is_typing": is_typing,
            }
        )

    # Event handlers
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
        }))

    async def typing_indicator(self, event):
        if event["user_id"] != self.user.id:
            await self.send(text_data=json.dumps({
                "type": "typing_indicator",
                "user_id": event["user_id"],
                "username": event["username"],
                "is_typing": event["is_typing"],
            }))

    async def user_status_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_status_update",
            "user_id": event["user_id"],
            "username": event["username"],
            "status": event["status"],
            "message": event["message"],
        }))

    # Database helpers
    @database_sync_to_async
    def check_room_access(self):
        try:
            room = ChatRoom.objects.get(slug=self.room_slug, room_type="public")
            return True
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        room = ChatRoom.objects.get(slug=self.room_slug, room_type="public")
        return Message.objects.create(
            room=room,
            sender=self.user,
            content=content
        )

    @database_sync_to_async
    def update_user_presence(self, is_online):
        room = ChatRoom.objects.get(slug=self.room_slug, room_type="public")
        presence, created = UserPresence.objects.get_or_create(
            user=self.user,
            defaults={"is_online": is_online, "current_room": room}
        )
        if not created:
            presence.is_online = is_online
            presence.last_seen = timezone.now()
            presence.current_room = room if is_online else None
            presence.save()
