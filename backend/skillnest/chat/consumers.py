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

# inside CommunityChatConsumer

    async def receive(self, text_data):
        """
        Accept either:
        - envelope style: { type: "chat_message", message_type: "image", content: "", media_url: "..." }
        - short style:    { type: "image", content: "", media_url: "..." }
        - or:             { action: "send", message_type: "...", ... }
        """
        try:
            data = json.loads(text_data)
        except Exception as e:
            logger.exception("Invalid JSON received")
            return

        # Look for various possible envelope keys
        envelope = data.get("type") or data.get("action") or data.get("event")
        # message_type is explicit OR fallback to envelope when envelope is a known message type
        message_type = data.get("message_type") or (envelope if envelope in ("text", "image", "video", "file") else None) or "text"

        logger.warning(f"Received envelope={envelope} message_type={message_type} from user {self.user.id}: {data}")

        # If it's a chat message (either explicit envelope or a known message_type), handle it
        if envelope == "chat_message" or message_type in ("text", "image", "video", "file"):
            await self.handle_chat_message(data, message_type=message_type)
        else:
            logger.warning(f"Unknown/unsupported action/type received: {envelope}")

    async def chat_message(self, event):
        """
        Called by group_send; event['message'] already contains the serialized message dict.
        """
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
        }))

    async def handle_chat_message(self, data, message_type="text"):
        """
        Save the message (text/media) and broadcast it to the group.
        Accepts either content (text) and/or media_url.
        """
        content = (data.get("content") or "").strip()
        media_url = data.get("media_url") or None

        # If both text and media are missing, ignore
        if not content and not media_url:
            return

        # persist
        message = await self.save_message(content=content, message_type=message_type, media_url=media_url)

        # broadcast (note "type": "chat_message" here -> calls chat_message)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": str(message.id),
                    "content": message.content,
                    "message_type": message.message_type,
                    "media_url": message.media_url,
                    "sender": {
                        "id": message.sender.id,
                        "username": message.sender.username,
                    },
                    "timestamp": message.timestamp.isoformat(),
                }
            }
        )

    @database_sync_to_async
    def save_message(self, content="", message_type="text", media_url=None):
        """
        Persist CommunityMessage including media_url and message_type.
        """
        return CommunityMessage.objects.create(
            room=self.room,
            sender=self.user,
            content=content or "",
            message_type=message_type,
            media_url=media_url
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

class CommunityMeetConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.community_id = self.scope["url_route"]["kwargs"]["community_id"]
            self.group_name = f"community_{self.community_id}"
            logger.info(f"🟢 CONNECT: {self.group_name}")

            user = self.scope.get("user")
            logger.info(f"User in connect: {user} | Authenticated: {getattr(user, 'is_authenticated', False)}")

            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            logger.info("✅ Accepted WebSocket connection")
        except Exception as e:
            logger.exception(f"❌ WS connect failed: {e}")
            await self.close()

    async def disconnect(self, close_code):
        logger.info("disconnecting")
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")
        logger.info("receive")
        if message_type == "start_meeting":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "meeting_started",
                    "meeting": data.get("meeting"),
                }
            )

    # Send to group
    async def meeting_started(self, event):
        logger.info("meeting started")
        await self.send(text_data=json.dumps({
            "type": "meeting_started",
            "meeting": event["meeting"],
        }))
    
    # 🔹 Send to clients when meeting ends
    async def meeting_ended(self, event):
        await self.send(text_data=json.dumps({
            "type": "meeting_ended",
            "meeting_id": event["meeting_id"],
        }))
