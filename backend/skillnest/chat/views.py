from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from accounts.models import User
from creator.models import Community
from .models import CommunityChatRoom, CommunityMessage, CommunityMessageRead
from .serializers import (
    CommunityChatRoomSerializer,
    CommunityMessageSerializer,
    UserSerializer,
)

def get_or_create_chat_room(community, user):
    try:
        return community.chat_room
    except Community.chat_room.RelatedObjectDoesNotExist:
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



# ✅ 2. List messages in a community chat
class CommunityMessagesView(generics.ListAPIView):
    serializer_class = CommunityMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagePagination

    def get_queryset(self):
        community_id = self.kwargs["community_id"]
        community = get_object_or_404(Community, id=community_id)
        user = self.request.user

        room = get_or_create_chat_room(community, user)

        if not (community.creator == user or community.members.filter(id=user.id).exists()):
            return CommunityMessage.objects.none()

        return (
            CommunityMessage.objects.filter(room=room)
            .select_related("sender", "reply_to__sender")
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

    content = request.data.get("content", "").strip()
    media_url = request.data.get("media_url")  #  Cloudinary URL
    message_type = request.data.get("message_type", "text")

    if not content and not media_url:
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

    CommunityMessageRead.objects.get_or_create(user=request.user, message=message)
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
