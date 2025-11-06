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
from django.utils import timezone

from google.oauth2 import id_token
from google.auth.transport import requests

import random
from .tasks import send_otp_email_task
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, permissions
from .models import Creator

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import cloudinary.uploader
from rest_framework.decorators import parser_classes,authentication_classes
from rest_framework.parsers import MultiPartParser, FormParser
import razorpay
from django.db import transaction
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

User = get_user_model()
from .models import User,Payment

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        logger.info(f"Registration data received: {request.data}")
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.debug(serializer.errors)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request):
        return Response({'message': 'Register view'})


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user = data['user']
            logger.info(f"User {user} logged in successfully.")
            #  # Check user status & approval conditions
            if user['user_type'] == 'creator':
                user_instance = User.objects.get(id=user['id'])
                # Creator must be approved and active
                creator_profile = Creator.objects.filter(user=user_instance).first() # Access related Creator profile, if not exists, None
                if not creator_profile or creator_profile.approve != 'accept':
                    logger.warning(f"Creator account for user {user['email']} is not approved.")
                    return Response(
                        {'success': False, 'error': 'Creator account is not approved yet.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

                if not user['status']:
                    logger.warning(f"Creator account for user {user['email']} is not active.")
                    return Response(
                            {'success': False, 'error': 'Creator account is not active. Please verify your email.'},
                            status=status.HTTP_403_FORBIDDEN
                        )
            elif user['user_type'] == 'learner':
                # Learner must be active
                if not user['status']:
                    return Response(
                        {'success': False, 'error': 'Learner account is not active. Please verify your email.'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )

            access_token = data['access']
            refresh_token = data['refresh']

            response = Response({
                'success': True,
                'user': data['user'],
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
            # --- Unified cookie settings ---
            expires_access = timezone.now() + settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]
            expires_refresh = timezone.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]

            cookie_args = dict(
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path="/",
                domain=None,  # set your domain if needed (e.g., '.skillnest.com')
            )
                # Set tokens in HttpOnly cookies
            response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS"],
            value=access_token,
            expires=expires_access,
            **cookie_args,
        )
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                value=refresh_token,
                expires=expires_refresh,
                **cookie_args,
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
@method_decorator(csrf_exempt, name="dispatch")
class RefreshTokenView(APIView):
    """Generate a new access token from refresh token."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        logger.debug("RefreshTokenView called")
        refresh_cookie_name = settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"]
        access_cookie_name = settings.SIMPLE_JWT["AUTH_COOKIE_ACCESS"]

        refresh_token = request.COOKIES.get(refresh_cookie_name)
        if not refresh_token:
            logger.warning("No refresh token found in cookies")
            return Response(
                {"detail": "Session expired. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            logger.info("New access token generated")

            response = Response(
                {"message": "New access token established.", "access": new_access_token},
                status=status.HTTP_200_OK,
            )

            # --- Overwrite access cookie safely ---
            expires_access = timezone.now() + settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]
            cookie_args = dict(
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path="/",
                domain=None,  # set this if you use custom domain
            )

            # Delete old one explicitly first
            response.delete_cookie(key=access_cookie_name, path="/", domain=None)
            # Then set new one (same attributes to ensure overwrite)
            response.set_cookie(
                key=access_cookie_name,
                value=new_access_token,
                expires=expires_access,
                **cookie_args,
            )

            logger.info("Access token cookie overwritten successfully")
            return response

        except TokenError as e:
            logger.warning(f"Token error: {e}")
            return Response(
                {"detail": f"Session expired. Please log in again. Error: {str(e)}"},
                status=status.HTTP_401_UNAUTHORIZED,
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
        logger.info(f"Received Google token: {token}")
        try:
            idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            "768158657502-ia2b2gh1gd3o69rm7ehh1rhtvfe2aapi.apps.googleusercontent.com"
            )
        except Exception as e:
            logger.error(f"Google token verification failed: {e}")
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract Google profile info
        email = idinfo["email"]
        name = idinfo.get("name", "")
        logger.info(f"Google ID info: email={email}, name={name}")
        User = get_user_model()
        logger.info("Before User.objects.get_or_create",User)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": email, "first_name": name, "user_type": "learner", "status": True ,"is_block": False }
        )
         # ✅ If user exists but is blocked
        if not created and user.is_block:
            logger.warning(f"Blocked user attempted Google login: {user.email}")
            return Response(
                {"error": "Your account has been blocked. Please contact the admin."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if created:
            user.status = True
            user.save(update_fields=["status"])
            logger.info(f"New Google user created: {user.email} as learner, type={user.user_type}")
        else:
            logger.info(f"Existing Google user logged in: {user.email}, type={user.user_type}")

        refresh = RefreshToken.for_user(user)
        logger.info("After RefreshToken.for_user")
        access = refresh.access_token
        logger.info("After access token generation, user authenticated",user.user_type)
        redirect_url = '/creatorhome' if user.user_type == 'creator' else '/learnerhome'

        response = JsonResponse({
            "message": "Login successful",
            "user": {
                "email": user.email,
                "username": user.username,
                "fullname": user.first_name,
                "user_type": user.user_type,
                "id": user.id,
                "status": user.status,
            },
            "redirect_url": redirect_url

        })
        access_token = str(access)
        refresh_token = str(refresh)
        logger.info(f"Generated tokens for Google login: access_token={access_token}, refresh_token={refresh_token}")
        # Secure cookies for tokens
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
        logger.info(f"Google login cookies set successfully {response.cookies}")
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
@authentication_classes([])
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
    

class CreateOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            amount = int(request.data.get("amount", 0)) * 100  # Convert ₹ → paise
            if amount <= 0:
                return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

            currency = "INR"

            # Initialize Razorpay client
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

            # Create Razorpay order
            payment = client.order.create({
                'amount': amount,
                'currency': currency,
                'payment_capture': '1'
            })

            # Return order info to frontend
            return Response({
                'order_id': payment['id'],
                'amount': amount,
                'currency': currency,
                'key': settings.RAZORPAY_KEY_ID
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Error creating order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {"error": "Missing payment details"},
                status=status.HTTP_400_BAD_REQUEST
            )

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        try:
            # ✅ Verify payment signature
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })

            email = data.get("email")
            amount = data.get("amount")
            user = None

            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Save Payment record safely
            with transaction.atomic():
                Payment.objects.create(
                    user=user,
                    order_id=razorpay_order_id,
                    payment_id=razorpay_payment_id,
                    status="success",
                    amount=amount,
                )

                # ✅ Upgrade user if learner → creator
                if user and user.user_type == "learner":
                    user.user_type = "creator"
                    user.save()
                    logger.info(user)

                    # Create Creator profile only if not exists
                    Creator.objects.get_or_create(user=user)
                    message = "Payment verified successfully! You’ve been upgraded to Creator. Please wait for admin approval before logging in."
                else:
                    message = "Payment verified successfully."
                logger.info(message)
            return Response({"status": message}, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError:
            logger.exception("Signature verification failed")
            return Response(
                {"error": "Payment verification failed (invalid signature)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            logger.exception("Unexpected error during payment verification")
            return Response(
                {"error": f"Unexpected error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
