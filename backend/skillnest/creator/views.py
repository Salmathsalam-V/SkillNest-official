from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly,AllowAny
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import PostSerializer,CommentSerializer,CommunitySerializer,CourseSerializer
from .models import Post,Comment,Community,Course

from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from accounts.authentication import JWTCookieAuthentication


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
        return Post.objects.filter(user_id=creator_id).order_by('-created_at')


# List all comments for a post / Create new comment
class CommentListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        post_id = self.kwargs['post_id']   # post/<id>/comments/
        return Comment.objects.filter(post_id=post_id).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, post_id=self.kwargs['post_id'])


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

class CommunityListCreateView(ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTCookieAuthentication]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class CommunityDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTCookieAuthentication]