from django.shortcuts import render
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import PostSerializer
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from . models import Post
from accounts.authentication import CustomJWTAuthentication


class PostView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    def perform_create(self, serializer):
        serializer.save(user=self.request.user.creator)
