# notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    post_id = serializers.IntegerField(source='post.id', read_only=True)
    sender = serializers.CharField(source='sender.email', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'sender', 'notif_type', 'post_id', 'read', 'created_at']
