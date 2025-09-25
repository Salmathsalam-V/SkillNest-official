# notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.email', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'sender', 'notif_type', 'post', 'read', 'created_at']
