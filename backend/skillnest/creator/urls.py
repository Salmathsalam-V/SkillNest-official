from django.urls import path
from .views import PostView, PostDetailView, CommentListCreateView, CommentDetailView,CreatorPostsView,CreatorCoursesView,CommunityMembersView
from .views import ToggleFollowView,ToggleLikeView,ReplyListCreateView,toggle_comment_like,CommunityListCreateView,CommunityDetailView,UserListView



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
    path("posts/<int:post_id>/comments/<int:comment_id>/replies/", ReplyListCreateView.as_view(), name="replies"),
    path("posts/<int:post_id>/comments/<int:comment_id>/like/", toggle_comment_like, name="comment-like"),
    path("creators/<int:creator_id>/courses/", CreatorCoursesView.as_view(), name="creator-courses"),
    path("communities/", CommunityListCreateView.as_view(), name="community-list-create"),
    path("creator/communities/community/<int:pk>/", CommunityDetailView.as_view(), name="community-detail"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("communities/<int:pk>/members/", CommunityMembersView.as_view(),name="community-members"),
]