from django.urls import path
from .views import PostView, PostDetailView, CommentListCreateView, CommentDetailView,CreatorPostsView,CreatorCoursesView
from .views import ToggleFollowView,ToggleLikeView

urlpatterns = [
    path('posts/', PostView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path("creators/<int:creator_id>/posts/", CreatorPostsView.as_view(), name="creator-posts"),
    path("creators/<int:creator_id>/posts/<int:pk>", PostDetailView.as_view(), name="creator-posts"),
    path('creators/posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path("creators/<int:creator_id>/follow/", ToggleFollowView.as_view(), name="toggle-follow"),
    path("creators/posts/<int:post_id>/like/", ToggleLikeView.as_view(), name="toggle-like"),

]