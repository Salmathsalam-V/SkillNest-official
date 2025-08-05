from django.shortcuts import render
from rest_framework.generics import ListAPIView
from accounts.serializers import UserSerializer,CombinedCreatorUserSerializer
from accounts.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated,IsAdminUser
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.authentication import CustomJWTAuthentication
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework import status

# Create your views here.
class LearnerListView(ListAPIView):
    permission_classes = [AllowAny] 
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

# class CreatorListView(ListAPIView):
#     permission_classes = [AllowAny] 
#     serializer_class = UserSerializer

#     def get_queryset(self):
#         return User.objects.filter(user_type='creator')

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return Response({
#             'success': True,
#             'creators': serializer.data
#         })

class CreatorListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CombinedCreatorUserSerializer

    def get_queryset(self):
        # Return users with type 'creator' AND having a creator profile
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
            creator = user.creator_profile
        except User.DoesNotExist:
            return Response({"success": False, "message": "Creator not found"}, status=status.HTTP_404_NOT_FOUND)

        approve_status = request.data.get("approve")
        if approve_status not in ["accept", "reject"]:
            return Response({"success": False, "message": "Invalid approval status"}, status=status.HTTP_400_BAD_REQUEST)

        creator.approve = approve_status
        creator.save()

        return Response({"success": True, "message": f"Creator has been {approve_status}ed."}, status=status.HTTP_200_OK)