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

class CreateMeetingRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateRoomSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        community_id = serializer.validated_data["community_id"]

        # Optional: check if user belongs to the community
        # if not CommunityMembership.objects.filter(user=request.user, community_id=community_id).exists():
        #     return Response({"error": "You are not part of this community."}, status=403)

        # Generate a unique room name
        room_name = f"community_{community_id}_{uuid.uuid4().hex[:8]}"

        # For dev, use public Jitsi server
        domain = getattr(settings, "JITSI_DOMAIN", "meet.jit.si")

        # ✅ Skip JWT during dev
        jwt_token = None

        # Save meeting info in DB
        meeting = Meeting.objects.create(
            host=request.user,
            community_id=community_id,
            room_name=room_name,
            domain=domain,
            created_at=timezone.now()
        )

        # Add host as participant
        meeting.participants.add(request.user)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"community_{community_id}",
            {
                "type": "meeting_started",
                "meeting": {
                    "roomName": meeting.room_name,
                    "domain": meeting.domain,
                    "meeting_id": str(meeting.id),
                    "host": request.user.username,
                },
            },
        )
        return Response({
            "roomName": room_name,
            "domain": domain,
            "jwt": jwt_token,  # stays None in dev
            "meeting_id": str(meeting.id)
        }, status=status.HTTP_200_OK)

def generate_jitsi_jwt(user, room_name, ttl_seconds=300):
    """
    Generates a JWT token for Jitsi authentication (if self-hosted with JWT enabled).
    """
    issuer = getattr(settings, "JITSI_APP_ID", None) or getattr(settings, "JITSI_JWT_ISSUER", "my-jitsi-app")
    secret = getattr(settings, "JITSI_APP_SECRET", None) or getattr(settings, "JITSI_JWT_SECRET", None)
    if not secret:
        return None

    now = datetime.utcnow()
    payload = {
        "aud": "jitsi",
        "iss": issuer,
        "sub": getattr(settings, "JITSI_DOMAIN", "meet.jit.si"),
        "room": room_name,
        "exp": now + timedelta(seconds=ttl_seconds),
        "nbf": now,
        "context": {
            "user": {
                "name": user.get_full_name() or user.username,
                "email": user.email
            }
        }
    }

    token = jwt.encode(payload, secret, algorithm="HS256")
    if isinstance(token, bytes):  # PyJWT v2+ returns str, older returns bytes
        token = token.decode("utf-8")

    return token
