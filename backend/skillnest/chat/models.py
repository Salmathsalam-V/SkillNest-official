# chat/models.py

from django.db import models
from accounts.models import User
from django.utils import timezone
import uuid


class ChatRoom(models.Model):
    ROOM_TYPES = (
        ('public', 'Public'),
        ('private', 'Private'),
        ('group', 'Group'),
    )
    
    id = models.BigAutoField(primary_key=True)           # ✅ keep integer PK
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False) 
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)    
    description = models.TextField(blank=True, null=True)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES, default='public')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    members = models.ManyToManyField(User, related_name='chat_rooms', blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        return self.members.count()
    
    @property
    def last_message(self):
        return self.messages.first()

class Message(models.Model):
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
        ('system', 'System'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', default=None)
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    timestamp = models.DateTimeField(default=timezone.now)
    edited_at = models.DateTimeField(null=True, blank=True)
    is_edited = models.BooleanField(default=False)
    reply_to = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}'

class UserPresence(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='presence')
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(default=timezone.now)
    current_room = models.ForeignKey(ChatRoom, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        status = "Online" if self.is_online else "Offline"
        return f'{self.user.username} - {status}'

class MessageRead(models.Model):
    """Track which messages have been read by which users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_by')
    read_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['user', 'message']


# class Message(models.Model):
#     room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     content = models.TextField()
#     timestamp = models.DateTimeField(default=timezone.now)
    
#     def __str__(self):
#         return f'{self.user.username}: {self.content[:50]}'
    
#     class Meta:
#         ordering = ['timestamp']

# class OnlineUser(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
#     last_seen = models.DateTimeField(default=timezone.now)
    
#     def __str__(self):
#         return f'{self.user.username} in {self.room.name}'