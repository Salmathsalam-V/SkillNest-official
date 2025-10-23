from django.urls import path
from . views import CreatorDetailView, LearnerDetailView, LearnerListView,CreatorListView,CreatorData,ContactUsView,CommunityListView,CommunityMembersView
from . views import ReportPostView,DashboardStatsView,LatestPostsView
# Adimn.urls.py

urlpatterns = [

    path('learners/', LearnerListView.as_view(), name='learners'),
    path('learners/<int:id>/', LearnerDetailView.as_view(), name='learner-detail'),
    path('creators/', CreatorListView.as_view(), name='creators'),
    path('creators/<int:id>/', CreatorDetailView.as_view(), name='creator-detail'),
    path('creators-view/<int:id>/', CreatorData.as_view(), name='creator-detail'),
    path('contact-us/', ContactUsView.as_view(), name='contact-us'),
    path('communities/', CommunityListView.as_view(), name='community-list'),
    path("communities/<int:pk>/members/", CommunityMembersView.as_view(),name="community-members"),
    path("post/reports", ReportPostView.as_view(),name="post-reports"),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('posts/latest/', LatestPostsView.as_view(), name='latest-posts'),
    path('admin-community/<int:pk>/', CommunityListView.as_view(), name='community-detail'),

]