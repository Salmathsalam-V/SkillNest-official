from rest_framework import serializers
from accounts.models import User
from creator.models import Community
from .models import CommunityChatRoom, CommunityMessage


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class CommunityChatRoomSerializer(serializers.ModelSerializer):
    community = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = CommunityChatRoom
        fields = [
            "id", "uuid", "community", "name", "description",
            "created_at", "member_count", "created_by"
        ]

    def get_community(self, obj):
        return {
            "id": obj.community.id,
            "name": obj.community.name,
            "creator": {
                "id": obj.community.creator.id,
                "username": obj.community.creator.username,
                "profile": getattr(obj.community.creator, "profile", None),  # add safely
            },
        }

    def get_created_by(self, obj):
        return {
            "id": obj.created_by.id,
            "username": obj.created_by.username,
            "profile": getattr(obj.created_by, "profile", None),
        }


class CommunityMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = CommunityMessage
        fields = ["id", "sender", "content", "message_type", "timestamp", "is_edited", "reply_to"]
