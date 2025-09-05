from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly,AllowAny
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import PostSerializer,CommentSerializer,CommunitySerializer,CourseSerializer,UserSerializer
from .models import Post,Comment,Community,Course
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from . models import Creator
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from accounts.authentication import JWTCookieAuthentication
from rest_framework.views import APIView
from rest_framework import generics, permissions
from accounts.models import User

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
        serializer.save(
            user=self.request.user,
            post_id=self.kwargs['post_id']
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
        comment = Comment.objects.get(id=comment_id, post_id=post_id)
    except Comment.DoesNotExist:
        return Response({"error": "Comment not found"}, status=404)

    user = request.user
    if user in comment.likes.all():
        comment.likes.remove(user)
        liked = False
    else:
        comment.likes.add(user)
        liked = True

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
            return Response(
                {'error': 'Creator not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        if creator.followers.filter(id=user.id).exists():
            # Already following → unfollow
            creator.followers.remove(user)
            return Response({
                'success': True,
                'following': False,
                'follower_count': creator.followers.count()
            }, status=status.HTTP_200_OK)

        else:
            # Not following → follow
            creator.followers.add(user)
            return Response({
                'success': True,
                'following': True,
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
        # Only list communities created by the logged-in user
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