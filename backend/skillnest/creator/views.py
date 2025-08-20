from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly,AllowAny
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import PostSerializer,CommentSerializer,CommunitySerializer
from .models import Post,Comment,Community
from accounts.authentication import CustomJWTAuthentication
from rest_framework.exceptions import PermissionDenied


# List all posts / Create a new post
class PostView(ListCreateAPIView):
    # permission_classes = [IsAuthenticatedOrReadOnly]  # anyone can read, only logged in can create
    # authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        # Save post with logged-in creator
        serializer.save(user=self.request.user.creator)


# Retrieve, Update, Delete a single post
class PostDetailView(RetrieveUpdateDestroyAPIView):
    # permission_classes = [IsAuthenticatedOrReadOnly]
    # authentication_classes = [CustomJWTAuthentication]
    permission_classes = [AllowAny]
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def perform_update(self, serializer):
        # only allow owner to update
        if self.get_object().user != self.request.user.creator:
            raise PermissionDenied("You cannot edit someone else’s post")
        serializer.save()

    def perform_destroy(self, instance):
        # only allow owner to delete
        if instance.user != self.request.user.creator:
            raise PermissionDenied("You cannot delete someone else’s post")
        instance.delete()

# List all comments for a post / Create new comment
class CommentListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    # permission_classes = [IsAuthenticatedOrReadOnly]
    # authentication_classes = [CustomJWTAuthentication]

    def get_queryset(self):
        post_id = self.kwargs['post_id']   # post/<id>/comments/
        return Comment.objects.filter(post_id=post_id).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, post_id=self.kwargs['post_id'])


# Retrieve, Update, Delete a comment
class CommentDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    # permission_classes = [IsAuthenticatedOrReadOnly]
    # authentication_classes = [CustomJWTAuthentication]
    queryset = Comment.objects.all()

    def perform_update(self, serializer):
        if self.get_object().user != self.request.user:
            raise PermissionDenied("You cannot edit someone else’s comment")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You cannot delete someone else’s comment")
        instance.delete()

class CommunityListCreateView(ListCreateAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class CommunityDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]