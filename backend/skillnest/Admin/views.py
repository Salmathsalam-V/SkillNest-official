from django.shortcuts import render
from rest_framework.generics import ListAPIView
from accounts.serializers import UserSerializer,CombinedCreatorUserSerializer
from accounts.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated,IsAdminUser
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.authentication import JWTCookieAuthentication
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework import status
from .serializers import ContactUsSerializer
from .models import ContactUs
from rest_framework import generics
from creator.models import Community,ReportPost,Post
from creator.serializers import CommunitySerializer ,ReportPostSerializer,PostSerializer
from django.shortcuts import get_object_or_404
from .serializers import DashboardStatsSerializer

from django.db.models import Count
from django.db.models.functions import TruncDate

import logging
logger = logging.getLogger(__name__)


class LearnerListView(ListAPIView):
    authentication_classes = [JWTCookieAuthentication]  
    permission_classes = [IsAuthenticated] 
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(user_type='learner')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'learners': serializer.data
        })

class LearnerDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.filter(user_type='learner')
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 
    lookup_field = 'id'


class CreatorListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CombinedCreatorUserSerializer

    def get_queryset(self):
        # Fetch only creators with a profile
        return User.objects.filter(user_type='creator', creator_profile__isnull=False).select_related('creator_profile')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'creators': serializer.data
        })

class CreatorDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.filter(user_type='creator')
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 
    lookup_field = 'id'

class CreatorData(APIView):
    permission_classes = [AllowAny]
    def get(self, request, id, *args, **kwargs):
        try:
            user = User.objects.select_related('creator_profile').get(id=id, user_type='creator')
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "Creator not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CombinedCreatorUserSerializer(user)
        return Response({
            "success": True,
            "creator": serializer.data
        }, status=status.HTTP_200_OK)
    
    def patch(self, request, id, *args, **kwargs):
        try:
            user = User.objects.select_related('creator_profile').get(id=id, user_type='creator')
        except User.DoesNotExist:
            return Response({"success": False, "message": "Creator not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CombinedCreatorUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "Creator updated successfully", "creator": serializer.data}, status=status.HTTP_200_OK)
        
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
class ContactUsView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = ContactUsSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Message sent successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request):
        messages = ContactUs.objects.select_related("user").order_by("-created_at")
        serializer = ContactUsSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CommunityListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        communities = Community.objects.all().prefetch_related('members', 'creator')
        serializer = CommunitySerializer(communities, many=True)
        return Response(serializer.data)

    def delete(self, request, pk=None):
        community_id = request.query_params.get("id") or pk
        logger.info(f"Attempting to delete community with ID: {community_id}")
        try:
            community = Community.objects.get(id=community_id)
            community.delete()
            return Response({"message": "Community deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Community.DoesNotExist:
            return Response({"error": "Community not found."}, status=status.HTTP_404_NOT_FOUND)
    
class CommunityMembersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def get(self, request, pk):
        community = get_object_or_404(Community, pk=pk)
        members = community.members.all().values("id", "username", "email")
        return Response(list(members))

class ReportPostView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        """Get all reported posts for admin view"""
        reports = ReportPost.objects.select_related('post', 'reported_by').order_by('-created_at')
        serializer = ReportPostSerializer(reports, many=True)
        return Response(serializer.data)

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # 1️⃣ Basic counts
        total_users = User.objects.count()
        creators = User.objects.filter(user_type='creator').count()
        learners = User.objects.filter(user_type='learner').count()
        communities = Community.objects.count()
        logger.info(f"Total Users: {total_users}, Creators: {creators}, Learners: {learners}, Communities: {communities}")
        # 2️⃣ User growth (last 30 days)
        user_growth = (
            User.objects
            .annotate(date=TruncDate('date_joined'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        # 3️⃣ Community growth (last 30 days)
        community_growth = (
            Community.objects
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        logger.info(f"User Growth Data: {user_growth}")
        logger.info(f"Community Growth Data: {community_growth}")
        # Format data for frontend
        data = {
            "total_users": total_users,
            "creators": creators,
            "learners": learners,
            "communities": communities,
            "user_growth": [
                {"date": item["date"].strftime("%Y-%m-%d"), "count": item["count"]}
                for item in user_growth
            ],
            "community_growth": [
                {"date": item["date"].strftime("%Y-%m-%d"), "count": item["count"]}
                for item in community_growth
            ],
        }

        serializer = DashboardStatsSerializer(data)
        return Response(data)

class LatestPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = (
            Post.objects
            .select_related('user')  
            .order_by('-created_at')[:9]
        )
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)