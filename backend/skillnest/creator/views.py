from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly,AllowAny
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import PostSerializer,CommentSerializer,CommunitySerializer,CourseSerializer,UserSerializer
from .models import Post,Comment,Community,Course
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets
from . models import Creator
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from accounts.authentication import JWTCookieAuthentication
from rest_framework.views import APIView
from rest_framework import generics, permissions
from accounts.models import User
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from notification.utils import create_notification



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
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        creator_id = self.kwargs['creator_id']
        return Course.objects.filter(user_id=creator_id).select_related("post").order_by("-post__created_at")


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

        return Response({
            "success": True,
            "liked": liked,
            "like_count": post.likes.count()
        }, status=status.HTTP_200_OK)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

# List + Create
class CommunityListCreateView(generics.ListCreateAPIView):
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Community.objects.filter(creator=self.request.user)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


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
        # allow POST for add action as well
        return self._update_members(request, pk)

    # helper for patch/post
    def _update_members(self, request, pk):
        print("request.data type:", type(request.data))
        print("request.data content:", request.data)
        
        community = get_object_or_404(Community, pk=pk)
        action_type = request.data.get("action", "add")
        identifier = request.data.get("member")
        print("Received identifier:", identifier, "of type", type(identifier))
        if isinstance(identifier, dict):
            identifier = identifier.get("member")
            print("Extracted identifier from dict:", identifier)
        if not identifier:
            return Response(
                {"error": "member field required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            print("Looking for user with identifier:", identifier)
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
            community.members.add(user)
        elif action_type == "remove":
            community.members.remove(user)
        else:
            return Response(
                {"error": "action must be 'add' or 'remove'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        community.save()
        return Response(
            CommunitySerializer(community, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )





            # create_notification(sender=user, recipient=creator.user, notif_type='follow')
