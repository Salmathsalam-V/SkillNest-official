
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatRoom, Message, UserPresence

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    reply_to = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'sender', 'timestamp', 'message_type', 
                 'is_edited', 'edited_at', 'reply_to']
    
    def get_reply_to(self, obj):
        if obj.reply_to:
            return {
                'id': str(obj.reply_to.id),
                'content': obj.reply_to.content[:100],
                'sender': obj.reply_to.sender.username
            }
        return None

class ChatRoomSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    member_count = serializers.ReadOnlyField()
    last_message = MessageSerializer(read_only=True)
    is_member = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'slug', 'description', 'room_type', 'created_by', 
                 'created_at', 'updated_at', 'member_count', 'last_message', 'is_member']
    
    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

class UserPresenceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserPresence
        fields = ['user', 'is_online', 'last_seen']