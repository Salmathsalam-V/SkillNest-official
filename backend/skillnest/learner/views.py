from django.shortcuts import render
from rest_framework import generics, permissions
from creator.models import Community
from creator.serializers import CommunitySerializer

# List communities where logged-in user is a member (learner)
class CommunityMemberListView(generics.ListAPIView):
    serializer_class = CommunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only list communities where the logged-in user is a member
        return Community.objects.filter(members=self.request.user).order_by("-created_at")