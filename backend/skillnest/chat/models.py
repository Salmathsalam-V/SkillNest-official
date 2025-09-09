# chat/models.py

from django.db import models
from accounts.models import User
from django.utils import timezone

class ChatRoom(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f'{self.user.username}: {self.content[:50]}'
    
    class Meta:
        ordering = ['timestamp']

class OnlineUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    last_seen = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f'{self.user.username} in {self.room.name}'