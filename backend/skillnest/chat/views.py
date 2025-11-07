from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from accounts.models import User
from creator.models import Community
from .models import CommunityChatRoom, CommunityMessage
from .serializers import (
    CommunityChatRoomSerializer,
    CommunityMessageSerializer,
    UserSerializer,
    CreateRoomSerializer,
)
from rest_framework.pagination import CursorPagination
import uuid
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from . models import Meeting
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .utils.zego_token import generate_zego_token
import uuid
import json
import hmac
import hashlib
import base64
import time
import httpx
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async

import logging
logger = logging.getLogger(__name__)

def get_or_create_chat_room(community, user):
    try:
        return community.chat_room
    except Community.chat_room.RelatedObjectDoesNotExist:
        logger.warning(f"Creating chat room for community: {community.uuid}")
        return CommunityChatRoom.objects.create(
            community=community,
            name=community.name,
            created_by=community.creator or user  # fallback
        )


class MessagePagination(PageNumberPagination): 
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


# ✅ 1. Fetch community chat room details
class CommunityChatRoomDetailView(generics.RetrieveAPIView):
    serializer_class = CommunityChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        community_id = self.kwargs["community_id"]
        community = get_object_or_404(Community, id=community_id)

        user = self.request.user
        if not (community.creator == user or community.members.filter(id=user.id).exists()):
            self.permission_denied(self.request, message="Not a member of this community")

        return get_or_create_chat_room(community, user)


class ChatMessagePagination(CursorPagination):
    page_size = 20                       # messages per request
    ordering = '-timestamp'              # newest first


# ✅ 2. List messages in a community chat
class CommunityMessagesView(generics.ListAPIView):
    serializer_class = CommunityMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ChatMessagePagination

    def get_queryset(self):
        community_id = self.kwargs["community_id"]
        community = get_object_or_404(Community, id=community_id)
        user = self.request.user

        room = get_or_create_chat_room(community, user)

        if not (community.creator == user or community.members.filter(id=user.id).exists()):
            return CommunityMessage.objects.none()

        return (
            CommunityMessage.objects.filter(room=room)
            .select_related("sender")
            .order_by("-timestamp")
        )


#  3. Send a message to a community chat
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def send_community_message(request, community_id):
    community = get_object_or_404(Community, id=community_id)
    room = community.chat_room

    user = request.user
    if not (community.creator == user or community.members.filter(id=user.id).exists()):
        return Response(
            {"error": "Not a member of this community"},
            status=status.HTTP_403_FORBIDDEN,
        )

    content = request.data.get("content", "")
    if isinstance(content, str):
        content = content.strip()
    else:
        content = ""  # fallback if content is dict or None
    media_url = request.data.get("media_url",None)  #  Cloudinary URL
    message_type = request.data.get("message_type", "text")

    if not content and not media_url:
        print("DEBUG SEND MESSAGE DATA:", request.data)
        return Response(
            {"error": "Message cannot be empty"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    message = CommunityMessage.objects.create(
        room=room,
        sender=user,
        content=content,
        media_url=media_url,
        message_type=message_type,
    )

    serializer = CommunityMessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ✅ 4. Mark message as read
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_message_read(request, community_id, message_id):
    community = get_object_or_404(Community, id=community_id)
    message = get_object_or_404(CommunityMessage, id=message_id, room=community.chat_room)

    # CommunityMessageRead.objects.get_or_create(user=request.user, message=message)
    return Response({"message": "Message marked as read"})


# ✅ 5. List community chat members
class CommunityChatMembersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        community_id = self.kwargs["community_id"]
        community = get_object_or_404(Community, id=community_id)

        user = self.request.user
        if not (community.creator == user or community.members.filter(id=user.id).exists()):
            return User.objects.none()

        return User.objects.filter(
            Q(id=community.creator.id) | Q(id__in=community.members.all())
        ).distinct()


# In your Django views.py or wherever you have CreateMeetingRoomView



def generate_kit_token(app_id: int, server_secret: str, room_id: str, user_id: str, username: str):
    """Generate ZegoUIKitPrebuilt Kit Token"""
    
    # Token expiration
    effective_time_in_seconds = 3600
    expire_time = int(time.time()) + effective_time_in_seconds
    
    # Payload for Kit Token
    payload = {
        "app_id": app_id,
        "user_id": user_id,
        "room_id": room_id,
        "privilege": {
            1: 1,  # Login privilege
            2: 1   # Publish privilege
        },
        "expire_time": expire_time
    }
    
    # Convert to JSON string
    payload_json = json.dumps(payload, separators=(',', ':'))
    
    # Base64 encode
    payload_base64 = base64.b64encode(payload_json.encode()).decode()
    
    # Create signature
    signature = hmac.new(
        server_secret.encode(),
        payload_base64.encode(),
        hashlib.sha256
    ).digest()
    
    signature_base64 = base64.b64encode(signature).decode()
    
    # Combine to create final token
    kit_token = f"04{payload_base64}.{signature_base64}"
    
    return kit_token

class CreateMeetingRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateRoomSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        community_id = serializer.validated_data["community_id"]

        # ✅ 1. Check for an existing active meeting in this community
        existing = Meeting.objects.filter(community_id=community_id, is_active=True).first()
        if existing:
            logger.info(f"Active meeting already exists: {existing.room_name}")
            kit_token = generate_kit_token(
                app_id=1551231778,
                server_secret='b5760c71682586e629b772f8fa71570f',
                room_id=existing.room_name,
                user_id=str(request.user.id),
                username=request.user.username
            )
            return Response({
                "roomName": existing.room_name,
                "appID": 1551231778,
                "token": kit_token,
                "meeting_id": str(existing.id),
                "already_active": True,
            }, status=status.HTTP_200_OK)

        # ✅ 2. Otherwise, create a new meeting
        room_name = f"community_{community_id}_{uuid.uuid4().hex[:8]}"
        kit_token = generate_kit_token(
            app_id=1551231778,
            server_secret='b5760c71682586e629b772f8fa71570f',
            room_id=room_name,
            user_id=str(request.user.id),
            username=request.user.username
        )

        meeting = Meeting.objects.create(
            host=request.user,
            community_id=community_id,
            room_name=room_name,
            domain="zegocloud",
            created_at=timezone.now(),
            is_active=True,  # ✅ ensure this is marked active
        )

        logger.info(f"New meeting created: {meeting.room_name}")
        return Response({
            "roomName": room_name,
            "appID": 1551231778,
            "token": kit_token,
            "meeting_id": str(meeting.id),
            "already_active": False,
        }, status=status.HTTP_200_OK)

    # ✅ PATCH method to end meeting
    def patch(self, request):
        meeting_id = request.data.get("meeting_id")
        logger.warning(f"Ending meeting for room: {meeting_id}")

        if not meeting_id:
            return Response({"error": "meeting_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            meeting = Meeting.objects.get(pk=meeting_id)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

        if not meeting.is_active:
            return Response({"message": "Meeting already ended"}, status=status.HTTP_200_OK)

        meeting.is_active = False
        meeting.ended_at = timezone.now()
        meeting.save()
        # channel_layer = get_channel_layer()
        # async_to_sync(channel_layer.group_send)(
        #     f"community_{meeting.community_id}_meeting",
        #     {
        #         "type": "meeting_ended",
        #         "meeting_id": str(meeting.id),
        #     },
        # )
        logger.warning(f"Meeting {meeting_id} ended at {meeting.ended_at}")
        return Response({
            "message": "Meeting ended successfully",
            "meeting_id": str(meeting.id),
            "is_active": meeting.is_active
        }, status=status.HTTP_200_OK)

class ActiveMeetingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, community_id):
        logger.info(f"Checking active meeting for community: {community_id}")
        logger.info(f"All meeting objects: {list(Meeting.objects.filter(community_id=community_id).values())}")
        meeting = (
            Meeting.objects
            .filter(community_id=community_id, is_active=True)
            .order_by("-created_at")
            .first()
        )
        if not meeting:
            return Response({"active_meeting": None}, status=status.HTTP_200_OK)

        return Response({
            "active_meeting": {
                "meeting_id": str(meeting.id),
                "roomName": meeting.room_name,
                "appID": 1551231778,
                "is_active": meeting.is_active,
                "host": meeting.host.username,
            }
        }, status=status.HTTP_200_OK)

@csrf_exempt
async def translate_text(request):
    try:
        data = await sync_to_async(lambda: request.body)()
        import json
        data = json.loads(data.decode())
        text = data.get("text")
        target = data.get("target", "en")

        if not text:
            return JsonResponse({"error": "Missing text"}, status=400)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://libretranslate.de/translate",  # ✅ works without API key
                json={
                    "q": text,
                    "source": "auto",  # works fine on libretranslate.de
                    "target": target,
                    "format": "text",
                },
                timeout=10.0,
            )

        if response.status_code != 200:
            return JsonResponse({
                "error": f"Translation API error {response.status_code}",
                "details": response.text
            }, status=response.status_code)

        result = response.json()
        return JsonResponse({"translated": result.get("translatedText", text)})

    except Exception as e:
        print("❌ Translation error:", e)
        return JsonResponse({"error": str(e)}, status=500)