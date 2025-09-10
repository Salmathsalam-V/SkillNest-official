from rest_framework import serializers
from .models import Post, Comment, Course, QA_Post
from accounts.models import User, Creator
from .models import Community
from django.contrib.auth import get_user_model


# --- User (simplified for nested usage) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'fullname', 'profile', 'user_type','email']


# --- Comment Serializer ---

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at','likes',
                'like_count', 'is_liked']
        read_only_fields = ['user', 'created_at', 'post', 'like_count', 'is_liked']
        
    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
# --- Post Serializer ---
class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    comments = CommentSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'image',
            'caption',
            'created_at',
            'likes',
            'like_count',
            'is_course',
            'comments',
            'is_liked',
        ]
        read_only_fields = ['like_count', 'created_at', 'comments', 'is_liked']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

# --- Course Serializer ---
class CourseSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'post', 'rating']


# --- QA Serializer ---
class QASerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)

    class Meta:
        model = QA_Post
        fields = ['id', 'course', 'user', 'question', 'answer', 'created_at']
# community
class CommunitySerializer(serializers.ModelSerializer):
    creator = serializers.ReadOnlyField(source='creator.username')  # show creator’s name
    members = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False
    )

    class Meta:
        model = Community
        fields = ['id', 'creator', 'name', 'description', 'members', 'created_at']
        read_only_fields = ['id', 'creator', 'created_at']

    def create(self, validated_data):
        request = self.context['request']
        user = request.user

        # Ensure only creators can create communities
        if user.user_type != 'creator':
            raise serializers.ValidationError("Only creators can create a community.")

        community = Community.objects.create(
            creator=user,
            name=validated_data['name'],
            description=validated_data.get('description', "")
        )

        # Add members if provided
        members = validated_data.get('members')
        if members:
            community.members.set(members)

        return community

