from jsonschema import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.http import JsonResponse

from rest_framework_simplejwt.views import  TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from accounts.authentication import CustomJWTAuthentication

from accounts.serializers import UserSerializer, LoginSerializer,CreatorSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests

import random
from .tasks import send_otp_email_task
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, permissions
from .models import Creator

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
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        response = Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token', path='/', samesite='None')
        response.delete_cookie('refresh_token', path='/', samesite='None')
        return response


class TokenRefreshCookieView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token is None:
                return Response({'error': 'Refresh token not provided'}, status=status.HTTP_400_BAD_REQUEST)

            request.data['refresh'] = refresh_token
            response = super().post(request, *args, **kwargs)

            access_token = response.data.get('access')

            res = Response({'refreshed': True}, status=status.HTTP_200_OK)
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            return res

        except Exception as e:
            return Response({'refreshed': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProtectedView(APIView):
    authentication_classes = [CustomJWTAuthentication]
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
            samesite='Lax',  # ✅ Allow cross-origin if your frontend is on a subdomain or localhost
            path='/'
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,  # ✅ Allow for HTTP during local dev
            samesite='Lax',  # ✅ Allow cross-origin if your frontend is on a subdomain or localhost
            path='/'
        )

        return response
    
def generate_otp():
    return str(random.randint(100000, 999999))

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp_view(request):
    email = request.data.get("email")
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
    permission_classes = [IsAuthenticated]
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


    