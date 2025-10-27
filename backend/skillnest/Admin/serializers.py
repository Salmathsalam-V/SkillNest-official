from rest_framework import serializers
from .models import ContactUs

class ContactUsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    profile_name = serializers.CharField(
        source="user.creator_profile.category", read_only=True
    )

    class Meta:
        model = ContactUs
        fields = [
            "id",
            "user",
            "username",
            "email",
            "profile_name",
            "content",
            "reply",
            "is_replied",
            "created_at",
            "replied_at",
        ]
        read_only_fields = ["user", "created_at", "is_replied", "replied_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            validated_data["user"] = request.user
        return super().create(validated_data)



# class ContactUsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ContactUs
#         fields = ['user', 'content', 'replay', 'created_at']
#         read_only_fields = ['replay', 'created_at']

#     def create(self, validated_data):
#         user = self.context['request'].user
#         validated_data['user'] = user
#         return ContactUs.objects.create(**validated_data)

class DashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    creators = serializers.IntegerField()
    learners = serializers.IntegerField()
    communities = serializers.IntegerField()
    user_growth = serializers.ListField()
    community_growth = serializers.ListField()
