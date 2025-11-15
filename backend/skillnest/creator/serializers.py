from rest_framework import serializers
from .models import Post, Comment, Course,Feedback
from accounts.models import User, Creator
from .models import Community,CommunityInvite,ReportPost,Review
from django.contrib.auth import get_user_model
import logging
logger = logging.getLogger(__name__)


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
    user = UserSerializer(read_only=True)
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


# community
class CommunitySerializer(serializers.ModelSerializer):
    creator = serializers.ReadOnlyField(source='creator.username')
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
        logger.info(f"Creating community by user: {user.username} and the request data: {validated_data}")
        # ✅ 1. Only creators can create communities
        if user.user_type != 'creator':
            raise serializers.ValidationError("Only creators can create a community.")

        # ✅ 2. Extract members if any
        members = validated_data.pop('members', [])
        logger.info(f"Invited members: {[member.username for member in members]}")
        # ✅ 3. Create the community
        community = Community.objects.create(
            creator=user,
            name=validated_data['name'],
            description=validated_data.get('description', "")
        )

        # ✅ 4. Create invite for each member
        for invited_user in members:
            # Prevent duplicate invites or self-invites
            if invited_user == user:
                continue
            CommunityInvite.objects.get_or_create(
                community=community,
                invited_by=user,
                invited_user=invited_user,
                status='pending',
                
            )

        return community

class CommunityInviteSerializer(serializers.ModelSerializer):
    community_name = serializers.CharField(source="community.name", read_only=True)
    invited_by_username = serializers.CharField(source="invited_by.username", read_only=True)

    class Meta:
        model = CommunityInvite
        fields = ["id", "community_name", "invited_by_username", "status", "created_at"]
        read_only_fields = ["id", "community_name", "invited_by_username", "created_at"]

class ReportPostSerializer(serializers.ModelSerializer):
    post_caption = serializers.CharField(source="post.caption", read_only=True)
    post_image = serializers.URLField(source="post.image", read_only=True)
    post_author = serializers.URLField(source="post.user.email", read_only=True)
    post_author_profile = serializers.URLField(source="post.user.profile", read_only=True)
    reported_by_username = serializers.CharField(source="reported_by.username", read_only=True)
    reported_by_profile = serializers.URLField(source="reported_by.profile", read_only=True)

    class Meta:
        model = ReportPost
        fields = [
            'id',
            'post',
            'post_image', 
            'post_caption',   
            'post_author',
            'post_author_profile',
            'reported_by',
            'reported_by_username',
            'reported_by_profile',
            'reason',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'reported_by', 'post', 'reported_by_username', 'reported_by_profile','post_image', 'post_caption','post_author_profile','post_author']
        # ✅ Add 'post' and 'reported_by' here

class ReviewSerializer(serializers.ModelSerializer):
    # --- Creator Details ---
    creator_username = serializers.CharField(source="creator.username", read_only=True)
    creator_email = serializers.EmailField(source="creator.email", read_only=True)
    creator_profile = serializers.URLField(source="creator.profile", read_only=True)

    # --- Reviewer (User) Details ---
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_profile = serializers.URLField(source="user.profile", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "creator",
            "creator_username",
            "creator_email",
            "creator_profile",
            "user",
            "user_username",
            "user_email",
            "user_profile",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "creator",
            "user",
            "creator_username",
            "creator_email",
            "creator_profile",
            "user_username",
            "user_email",
            "user_profile",
            "created_at",
        ]

    def create(self, validated_data):
        """Attach the current user and creator automatically."""
        request = self.context.get("request")
        creator = self.context.get("creator")

        if not request or not creator:
            raise serializers.ValidationError("Request or creator context missing.")

        return Review.objects.create(
            user=request.user,
            creator=creator,
            **validated_data
        )
    
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'creator', 'user', 'feedback', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        community = self.context.get("community")
        validated_data.pop("community", None)
        return Feedback.objects.create(community=community, **validated_data)

class PostDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'image',
            'caption',
            'created_at',
            'likes_count',
            'is_liked',
            'comments',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'likes_count', 'comments', 'is_liked']
    
    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False