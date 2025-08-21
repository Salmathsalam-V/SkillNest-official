from rest_framework import serializers
from .models import ContactUs

class ContactUsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)  # optional
    # if you have a Creator profile attached to User
    profile_name = serializers.CharField(source="user.creator_profile.category", read_only=True)  

    class Meta:
        model = ContactUs
        fields = ['id', 'user', 'username', 'email', 'profile_name', 'content', 'replay', 'created_at']
        read_only_fields = ['created_at', 'user']

    def create(self, validated_data):
        # If user is in request context and is authenticated → override
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return ContactUs.objects.create(**validated_data)




# class ContactUsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ContactUs
#         fields = ['user', 'content', 'replay', 'created_at']
#         read_only_fields = ['replay', 'created_at']

#     def create(self, validated_data):
#         user = self.context['request'].user
#         validated_data['user'] = user
#         return ContactUs.objects.create(**validated_data)
