from jsonschema import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework_simplejwt.views import  TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from accounts.authentication import JWTCookieAuthentication
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from accounts.serializers import UserSerializer, LoginSerializer,CreatorSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .authentication import JWTCookieAuthentication

from google.oauth2 import id_token
from google.auth.transport import requests

import random
from .tasks import send_otp_email_task
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, permissions
from .models import Creator

import cloudinary.uploader
from rest_framework.decorators import parser_classes,authentication_classes
from rest_framework.parsers import MultiPartParser, FormParser
import logging
logger = logging.getLogger(__name__)

User = get_user_model()
from .models import User

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request):
        return Response({'message': 'Register view'})


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            access_token = data['access']
            refresh_token = data['refresh']

            response = Response({
                'user': data['user'],
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)

            # Set tokens in HttpOnly cookies
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path='/'
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path='/'
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]  # don't require access token
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if not refresh_token:
            return Response({"detail": "No refresh token"}, status=status.HTTP_400_BAD_REQUEST)

        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie(
            settings.SIMPLE_JWT['AUTH_COOKIE_ACCESS'], 
            path='/', 
            samesite='None',
        )
        response.delete_cookie(
            settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'], 
            path='/', 
            samesite='None',
        )
        return response

class RefreshTokenView(APIView):
    """ Generate new access token with refresh token if access token is expired."""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        print(f"Refresh token from cookies: {refresh_token}")
        print(f"All cookies: {request.COOKIES}")
        print(f"Cookie key being used: {settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH']}")
        
        if refresh_token is None:
            print("No refresh token found in cookies")
            return Response(
                {"detail": "Session expired. Please log in again from refresh."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Validate the token
            token = RefreshToken(refresh_token)
            print(f"Token validated successfully")
            
            # Generate new access token
            access_token = str(token.access_token)
            print(f"New access token generated")

            response = Response(
                {"message": "New access token established."}, 
                status=status.HTTP_200_OK
            )

            # Set access token in cookie
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_ACCESS'],
                value=access_token,
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                path='/'
            )

            print("Access token cookie set successfully")
            return response

        except TokenError as e:
            print(f"Token error: {e}")
            print(f"Token error type: {type(e)}")
            return Response(
                {"detail": f"Session expired. Please log in again. Error: {str(e)}"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
class ProtectedView(APIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "You are authenticated"})
    
class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            "768158657502-ia2b2gh1gd3o69rm7ehh1rhtvfe2aapi.apps.googleusercontent.com"
        )
        email = idinfo["email"]
        name = idinfo.get("name", "")

        User = get_user_model()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": email, "first_name": name}
        )

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        redirect_url = '/creatorhome' if user.user_type == 'creator' else '/learnerhome'
        response = JsonResponse({
            "message": "Login successful",
            "user": {
                "email": user.email,
                "username": user.username,
                "fullname": user.first_name,
                "user_type": user.user_type,

            },
            "redirect_url": redirect_url

        })
    
        # Secure cookies for tokens
        response.set_cookie(
            key='access_token',
            value=str(access),
            httponly=True,
            secure=False,  # ✅ Allow for HTTP during local dev
            samesite='None', 
            path='/'
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,  # ✅ Allow for HTTP during local dev
            samesite='None',  
            path='/'
        )

        return response
    
def generate_otp():
    return str(random.randint(100000, 999999))

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp_view(request):
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)        
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    otp = generate_otp()

    # Store OTP in cache 
    cache.set(f"otp_{email}", otp, timeout=300)  # Store OTP for 5 minutes

    send_otp_email_task.delay(email, otp) # celry task to send email
    return Response({"message": "OTP sent"})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    email = request.data.get("email")
    user_otp = request.data.get("otp")

    saved_otp = cache.get(f"otp_{email}")

    if saved_otp == user_otp:
        try:
            user = User.objects.get(email=email)
            user.status = True
            user.save()
            return Response({"verified": True, "user_type": user.user_type})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
    else:
        return Response({"verified": False}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')

    if not (email and new_password):
        return Response({'error': 'Email and new password are required'}, status=400)

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        print(user)
        return Response({'message': f'{user.email} {user.user_type} password updated successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

class ProfileView(APIView):
    permission_classes = [JWTCookieAuthentication]
    def get(self, request):
        try:
            user = request.user
            return Response({
                "username": user.username,
                "email": user.email,
                "fullname": user.fullname,
                "user_type": user.user_type
            })
        except ValueError:
            return Response({"error":"Profile not loaded"})
        
class CreatorCreateView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CreatorSerializer


@api_view(["get"])
def search_users(request):
    q = request.query_params.get("q", "")
    users = User.objects.filter(username__icontains=q) | User.objects.filter(email__icontains=q)
    data = [{"id": u.id, "username": u.username, "email": u.email} for u in users[:10]]
    return Response(data)

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def upload_image(request):
    file = request.FILES.get('file')
    logger.info(f"Received file: {file}")
    if not file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = cloudinary.uploader.upload(file, folder="skillnest")
        logger.info(f"Cloudinary upload result: {result}")
        return Response({
            "url": result.get("secure_url"),
            "public_id": result.get("public_id")
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print("Cloudinary upload failed:", e)
        return Response({"error": "Upload failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)