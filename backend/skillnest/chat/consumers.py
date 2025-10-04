# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from accounts.models import User
from .models import CommunityChatRoom, CommunityMessage,UserPresence
import logging
logger = logging.getLogger(__name__)

class CommunityChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        logger.warning(f"scope from consumer: {self.user}")

        if self.user.is_anonymous:
            logger.warning("Anonymous user tried to connect to WebSocket")
            await self.close()
            return

        # Get room_slug from URL
        self.room_uuid  = self.scope['url_route']['kwargs']['room_uuid']
        self.room = await self.get_room_if_allowed()
        if not self.room:
            logger.warning(f"User {self.user.id} not allowed in room {self.room_uuid}")
            await self.close()
            return
        self.room_group_name = f'community_{self.room_uuid}'

        # Check if this is a valid community room
        # has_access = await self.check_room_access()
        # if not has_access:
        #     await self.close()
        #     return
    
        # Add this channel to the group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        logger.warning(f"User {self.user.id} connected to room {self.room_uuid}, before accept")
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
                "status": "online"
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            logger.warning(f"User {self.user.id} disconnected from room {self.room_uuid}")
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
        logger.warning(f"Received message of type {message_type} from user {self.user.id}")
        if message_type == "chat_message":
            await self.handle_chat_message(data)
        elif message_type == "typing":
            await self.handle_typing(data)

    async def handle_chat_message(self, data):
        content = (data.get("content") or "").strip()
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
    @database_sync_to_async
    def get_room_if_allowed(self):
        try:
            room = CommunityChatRoom.objects.select_related("community").get(uuid=self.room_uuid)
            community = room.community
            logger.warning(f"Fetched room {room.id} for community {community.id}")
            if community.creator == self.user or community.members.filter(id=self.user.id).exists():
                return room
        except CommunityChatRoom.DoesNotExist:
            return None
        return None

    @database_sync_to_async
    def save_message(self, content):
        return CommunityMessage.objects.create(room=self.room, sender=self.user, content=content)

    @database_sync_to_async
    def update_user_presence(self, is_online):
        presence, created = UserPresence.objects.get_or_create(user=self.user)
        presence.is_online = is_online
        presence.current_room = self.room if is_online else None
        presence.last_seen = timezone.now()
        presence.save()
    
    async def user_status_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_status_update",
            "user_id": event["user_id"],
            "username": event["username"],
            "status": event["status"],
        }))
