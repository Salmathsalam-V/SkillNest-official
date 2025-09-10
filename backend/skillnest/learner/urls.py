from django.urls import path
from .views import CommunityMemberListView
from creator.views import CommunityDetailView
urlpatterns = [
    path('communities/', CommunityMemberListView.as_view(), name='learner-communities'),
    path("communities/<int:pk>/", CommunityDetailView.as_view(), name="community-detail"),

]