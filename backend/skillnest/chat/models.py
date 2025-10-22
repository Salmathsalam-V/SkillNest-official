from django.db import models
from accounts.models import User
from creator.models import Community  
from django.utils import timezone
import uuid


class CommunityChatRoom(models.Model):
    """
    A chat room that belongs to a Community
    """
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    community = models.OneToOneField(
        Community,
        on_delete=models.CASCADE,
        related_name="chat_room"
    )
    name = models.CharField(max_length=150)  # can default to community.name
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="community_chat_rooms"
    )
    members = models.ManyToManyField(
        User,
        related_name="community_chats",
        blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"ChatRoom for {self.community.name}"

    @property
    def member_count(self):
        return self.members.count()

    @property
    def last_message(self):
        return self.messages.first()


class CommunityMessage(models.Model):
    """
    Messages inside a CommunityChatRoom
    """
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('file', 'File'),
        ('system', 'System'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(
        CommunityChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="community_messages"
    )
    content = models.TextField(blank=True)  # optional for media-only messages
    media_url = models.URLField(blank=True, null=True)  # Cloudinary URL
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    timestamp = models.DateTimeField(default=timezone.now)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_edited = models.BooleanField(default=False)


    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.room.community.name}] {self.sender.username}: {self.content[:40]}"


class UserPresence(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="presence")
    is_online = models.BooleanField(default=False)
    current_room = models.ForeignKey(
        CommunityChatRoom, null=True, blank=True, on_delete=models.SET_NULL
    )
    last_seen = models.DateTimeField(auto_now=True)
