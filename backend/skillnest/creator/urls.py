from django.urls import path
from .views import PostView, PostDetailView, CommentListCreateView, CommentDetailView,CreatorPostsView,CreatorCoursesView,CommunityMembersView
from .views import ToggleFollowView,ToggleLikeView,ReplyListCreateView,toggle_comment_like,CommunityListCreateView,CommunityDetailView,UserListView
from .views import PendingInvitesView,RespondToInviteView,ReportPostView,CommunityDeleteView,AllFollowersListView,CreatorReviewListCreateView,CreatorFollowersView



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
    path("communities/<int:pk>/delete/", CommunityDeleteView.as_view(), name="community-delete"),
    path("creator/communities/community/<int:pk>/", CommunityDetailView.as_view(), name="community-detail"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("all-followers/", AllFollowersListView.as_view(), name="all-user-list"),
    path("communities/<int:pk>/members/", CommunityMembersView.as_view(),name="community-members"),
    path("invites/", PendingInvitesView.as_view(), name="pending-invites"),
    path("invites/<int:pk>/", RespondToInviteView.as_view(), name="respond-invite"),
    path("post/<int:post_id>/reports/", ReportPostView.as_view(), name="report-posts"),
    path('creators/<int:creator_id>/reviews/', CreatorReviewListCreateView.as_view(), name='creator-reviews'),
    path('creators/<int:pk>/followers/', CreatorFollowersView.as_view(), name="creator-followers")

]