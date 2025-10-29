from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly,AllowAny
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import PostSerializer,CommentSerializer,CommunitySerializer,CourseSerializer,UserSerializer,CommunityInviteSerializer,ReportPostSerializer,ReviewSerializer
from .models import Post,Comment,Community,Course,Review
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets
from . models import Creator,CommunityInvite,ReportPost
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from accounts.authentication import JWTCookieAuthentication
from rest_framework.views import APIView
from rest_framework import generics, permissions
from accounts.models import User
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from notification.utils import create_notification
from django.db.models import Q
import logging
logger = logging.getLogger(__name__)



class PostView(ListCreateAPIView):
    permission_classes = [AllowAny] 
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        # Save post with logged-in creator
        serializer.save(user=self.request.user.creator)


# Retrieve, Update, Delete a single post
class PostDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def perform_update(self, serializer):
        # post = self.get_object()
        # user = getattr(self.request.user, "creator", None)
        # if not user or post.user != user:
        #     raise PermissionDenied("You cannot edit someone else’s post")
        serializer.save()

    def perform_destroy(self, instance):
        # user = getattr(self.request.user, "creator", None)
        # if not user or instance.user != user:
        #     raise PermissionDenied("You cannot delete someone else’s post")
        instance.delete()

class CreatorPostsView(ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        creator_id = self.kwargs['creator_id']
        return Post.objects.filter(user_id=creator_id).order_by('-created_at')

    def perform_create(self, serializer):
        creator_id = self.kwargs['creator_id']
        serializer.save(user_id=creator_id)  
    
class CreatorCoursesView(ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        creator_id = self.kwargs['creator_id']
        return Post.objects.filter(user_id=creator_id, is_course=True).order_by("-created_at")

# List all comments for a post / Create new comment
class CommentListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(
            post_id=post_id, parent=None
        ).order_by("-created_at")   # Only main comments

    def perform_create(self, serializer):
        comment = serializer.save(
            user=self.request.user,
            post_id=self.kwargs['post_id']
        )

        post = comment.post
        # if post.user != self.request.user: 
             # don’t notify if you comment on your own post
        create_notification(
            sender=self.request.user,
            recipient=post.user,  # Creator.user is the actual User
            notif_type='comment',
            post=post
        )


class ReplyListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        comment_id = self.kwargs['comment_id']
        return Comment.objects.filter(parent_id=comment_id).order_by("created_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            parent_id=self.kwargs['comment_id'],
            post_id=self.kwargs['post_id']
        )
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_comment_like(request, post_id, comment_id):
    try:
        post = get_object_or_404(Post, id=post_id)
        comment = Comment.objects.get(id=comment_id, post_id=post_id)
        print("Found comment:", comment)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found"}, status=404)

    user = request.user
    if user in comment.likes.all():
        comment.likes.remove(user)
        liked = False
    else:
        comment.likes.add(user)
        liked = True
        create_notification(sender=user, recipient=post.user, notif_type='comment_like', post=post)

    return Response({
        "success": True,
        "liked": liked,
        "like_count": comment.likes.count()
    })

# Retrieve, Update, Delete a comment
class CommentDetailView(RetrieveUpdateDestroyAPIView):
    
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]
    queryset = Comment.objects.all()

    def perform_update(self, serializer):
        if self.get_object().user != self.request.user:
            raise PermissionDenied("You cannot edit someone else’s comment")
        serializer.save()

    def perform_destroy(self, instance):
        post_owner = instance.post.user  # this is a Creator
        request_user = self.request.user
        if instance.user != request_user and post_owner.user != request_user:
            raise PermissionDenied("You cannot delete someone else’s comment")
        instance.delete()

class ToggleFollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, creator_id, *args, **kwargs):
        try:
            creator = Creator.objects.get(user=creator_id)
        except Creator.DoesNotExist:
            return Response({'error': 'Creator not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        if creator.followers.filter(id=user.id).exists():
            # Already following → unfollow
            creator.followers.remove(user)
            following = False
        else:
            # Follow → notify creator.user
            creator.followers.add(user)
            following = True
            create_notification(
                sender=user,
                recipient=creator.user,     # notify the creator (User model)
                notif_type='follow'
            )

        return Response({
            'success': True,
            'following': following,
            'follower_count': creator.followers.count()
        }, status=status.HTTP_200_OK)
class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id, *args, **kwargs):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if post.likes.filter(id=user.id).exists():
            # Already liked → unlike
            post.likes.remove(user)
            liked = False
        else:
            # Not liked → like
            post.likes.add(user)
            liked = True
        if user != post.user:  # don’t notify yourself
            create_notification(
                sender=user,
                recipient=post.user,
                notif_type='like',
                post=post
            )
        return Response({
            "success": True,
            "liked": liked,
            "like_count": post.likes.count()
        }, status=status.HTTP_200_OK)

class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class AllFollowersListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        creator = Creator.objects.filter(user=user).first()
        if not creator:
            # Return empty queryset if not a creator
            return User.objects.none()

        return creator.followers.all()
     
# List + Create
class CommunityListCreateView(generics.ListCreateAPIView):
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Community.objects.filter(
            Q(creator=user) | Q(members=user)
        ).distinct().order_by('-created_at')
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
class CommunityDeleteView(generics.DestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only allow creator to delete
        return Community.objects.filter(creator=self.request.user)
# Retrieve + Update + Delete
class CommunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can only edit/delete their own communities
        return Community.objects.filter(creator=self.request.user)
    
class CommunityMembersView(APIView):
    """
    Handles:
        GET    /api/creator/communities/<pk>/members/
        PATCH  /api/creator/communities/<pk>/members/
        POST   /api/creator/communities/<pk>/members/
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        community = get_object_or_404(Community, pk=pk)
        data = [
            {"id": u.id, "username": u.username, "email": u.email}
            for u in community.members.all()
        ]
        return Response({"members": data}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self._update_members(request, pk)

    def post(self, request, pk):
        return self._update_members(request, pk)

    # helper for patch/post
    def _update_members(self, request, pk):
        print("request.data type:", type(request.data))
        print("request.data content:", request.data)

        community = get_object_or_404(Community, pk=pk)
        action_type = request.data.get("action", "add")
        identifier = request.data.get("member")

        if isinstance(identifier, dict):
            identifier = identifier.get("member")

        if not identifier:
            return Response(
                {"error": "member field required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # find user by username or email
        try:
            user = (
                User.objects.get(username=identifier)
                if "@" not in identifier
                else User.objects.get(email=identifier)
            )
        except User.DoesNotExist:
            return Response(
                {"error": f"User {identifier} not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if action_type == "add":
            # Check if user is already in community
            if user in community.members.all():
                return Response({"message": "User already a member"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if invite already exists
            existing_invite = CommunityInvite.objects.filter(
                community=community, invited_user=user, status="pending"
            ).first()
            if existing_invite:
                return Response({"message": "Invite already sent"}, status=status.HTTP_400_BAD_REQUEST)

            # Create invite instead of adding directly
            invite = CommunityInvite.objects.create(
                community=community,
                invited_by=request.user,
                invited_user=user,
            )

            return Response(
                {"message": f"Invitation sent to {user.username}", "invite_id": invite.id},
                status=status.HTTP_201_CREATED,
            )

        elif action_type == "remove":
            # Remove user if already a member
            if user in community.members.all():
                community.members.remove(user)
                return Response({"message": f"{user.username} removed from community"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "User not a member"}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response(
                {"error": "action must be 'add' or 'remove'"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class PendingInvitesView(generics.ListAPIView):
    """GET: List pending invites for the logged-in learner"""
    serializer_class = CommunityInviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        result= CommunityInvite.objects.filter(invited_user=user, status="pending").order_by("-created_at")
        logger.info(f"Pending invites for user {user.username}: {result}")
        return result

class RespondToInviteView(generics.UpdateAPIView):
    """PATCH: Accept or decline an invite"""
    serializer_class = CommunityInviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            invite = CommunityInvite.objects.get(pk=pk, invited_user=request.user)
        except CommunityInvite.DoesNotExist:
            return Response({"error": "Invite not found"}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")
        if action not in ["accept", "decline"]:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        if action == "accept":
            invite.status = "accepted"
            invite.community.members.add(request.user)  # add learner to community
        else:
            invite.status = "declined"

        invite.save()
        return Response(CommunityInviteSerializer(invite).data, status=status.HTTP_200_OK)
    
class ReportPostView(generics.ListCreateAPIView):
    serializer_class = ReportPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return all reports for a given post"""
        post_id = self.kwargs['post_id']
        return ReportPost.objects.filter(post_id=post_id).order_by('-created_at')
    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id)
        serializer.save(post=post, reported_by=self.request.user)

class CreatorReviewListCreateView(APIView):
    """
    GET: List all reviews for a specific creator.
    POST: Create a new review for that creator.
    """
    permission_classes = [permissions.IsAuthenticated]   
    # def get_permissions(self):
    #     if self.request.method == "POST":
    #         return [IsAuthenticated()]
    #     return [AllowAny()]

    def get(self, request, creator_id):
        """Fetch all reviews for a given creator"""
        creator = get_object_or_404(User, id=creator_id)
        reviews = Review.objects.filter(creator=creator).order_by("-created_at")
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, creator_id):
        """Create a review for a specific creator"""
        logger.info('before post')
        logger.info(f"POST /reviews by {request.user} (auth={request.user.is_authenticated})")
        creator = get_object_or_404(User, id=creator_id)
        serializer = ReviewSerializer(
            data=request.data,
            context={"request": request, "creator": creator},
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class CreatorFollowersView(APIView):
    permission_classes = [permissions.IsAuthenticated]   
    def get(self, request, pk):
        creator = get_object_or_404(Creator, user=pk)
        followers = creator.followers.all().values('id', 'username', 'email', 'profile')
        return Response({"followers": followers})
