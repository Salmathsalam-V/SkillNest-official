from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from . models import Creator

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'fullname', 'user_type','status','profile']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            fullname=validated_data['fullname'],
            user_type=validated_data['user_type'],
            profile=validated_data.get('profile'),
            status=False
        )
        return user

    def update(self, instance, validated_data):
        # prevent email, user_type, and password from being updated
        validated_data.pop('email', None)
        validated_data.pop('user_type', None)
        validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])

        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        refresh = RefreshToken.for_user(user)

        return {
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'fullname': user.fullname,
                'user_type': user.user_type,
                'status': user.status  # 👈 Add this line to return status
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'status': user.status  # 👈 Optionally expose it directly
        }

class CreatorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)  # Add email field
    
    class Meta:
        model = Creator
        fields = ['id', 'email', 'category', 'description', 'background','approve']  # Include email
        read_only_fields = ['id','approve']

    def validate_category(self, value):
        if not value:
            raise serializers.ValidationError("Category is required.")
        return value

    def validate_email(self, value):
        """Validate that user exists with this email"""
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')  # Remove email from validated_data
        
        # Get user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        # Check if user already has a creator profile
        if hasattr(user, 'creator_profile'):
            raise serializers.ValidationError("User already has a creator profile")
        
        # Add user to validated_data
        validated_data['user'] = user
        return super().create(validated_data)
    


class CombinedCreatorUserSerializer(serializers.ModelSerializer):
    # Writable fields for Creator (via source)
    category = serializers.CharField(source='creator_profile.category')
    description = serializers.CharField(source='creator_profile.description')
    background = serializers.CharField(source='creator_profile.background', allow_blank=True, allow_null=True)
    approve = serializers.CharField(source='creator_profile.approve')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'profile', 'user_type', 'status',
                  'category', 'description', 'background', 'approve']

    def update(self, instance, validated_data):
        # Extract nested creator_profile data
        creator_data = validated_data.pop('creator_profile', {})

        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Creator fields
        creator = instance.creator_profile
        for attr, value in creator_data.items():
            setattr(creator, attr, value)
        creator.save()

        return instance
