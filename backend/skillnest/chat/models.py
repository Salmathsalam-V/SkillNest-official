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


class Meeting(models.Model):
    """
    Stores info about each group video call session (via Jitsi or any provider).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    host = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="hosted_meetings",
        help_text="The user who started the meeting"
    )
    community = models.ForeignKey(
        Community,  
        on_delete=models.CASCADE,
        related_name="meetings",
        null=True,
        blank=True
    )
    room_name = models.CharField(max_length=255, unique=True)
    domain = models.CharField(max_length=255, default="meet.jit.si")
    jwt_token = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(blank=True, null=True)
    ended_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    duration = models.PositiveIntegerField(default=0, help_text="Duration in seconds")

    # ManyToMany for participants
    participants = models.ManyToManyField(
        User,
        related_name="meetings_joined",
        blank=True,
        help_text="All users who joined this meeting"
    )

    def mark_started(self):
        """Mark when meeting starts."""
        if not self.started_at:
            self.started_at = timezone.now()
            self.is_active = True
            self.save(update_fields=["started_at", "is_active"])

    def mark_ended(self):
        """Mark when meeting ends and calculate duration."""
        if not self.ended_at:
            self.ended_at = timezone.now()
            self.is_active = False
            if self.started_at:
                self.duration = int((self.ended_at - self.started_at).total_seconds())
            self.save(update_fields=["ended_at", "is_active", "duration"])

    def add_participant(self, user):
        """Convenience method to add a participant."""
        self.participants.add(user)
        self.save()

    def remove_participant(self, user):
        """Remove participant (optional)."""
        self.participants.remove(user)
        self.save()

    def __str__(self):
        return f"{self.room_name} ({self.community})"


class MeetingParticipant(models.Model):
    """
    Optional: Track join/leave times per participant (for attendance logs).
    """

    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="participant_logs")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(blank=True, null=True)
    duration = models.PositiveIntegerField(default=0, help_text="Time spent in meeting (seconds)")

    def mark_left(self):
        """Record when participant leaves and update duration."""
        if not self.left_at:
            self.left_at = timezone.now()
            self.duration = int((self.left_at - self.joined_at).total_seconds())
            self.save(update_fields=["left_at", "duration"])

    def __str__(self):
        return f"{self.user} in {self.meeting.room_name}"