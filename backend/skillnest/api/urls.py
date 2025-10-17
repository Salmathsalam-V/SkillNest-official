from django.urls import path
from . import views
from accounts.views import LoginView, RegisterView,ProtectedView, RefreshTokenView,LogoutView,GoogleLoginAPIView,send_otp_view,verify_otp_view,reset_password_view,ProfileView,CreatorCreateView,search_users
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from creator.views import PostView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('login/', LoginView.as_view(), name='login'),
    path('protected/', ProtectedView.as_view(), name='protected_view'),
    path('post/', PostView.as_view(),name='post'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('google-login/', GoogleLoginAPIView.as_view(), name='google-login'),
    path('send_otp/',send_otp_view, name='sent-otp'),
    path('verify_otp/', verify_otp_view, name='verify-otp'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('reset_password/', reset_password_view, name='reset_password'),
    path('create-creator/', CreatorCreateView.as_view(), name='create-creator'),
    path('search-users/', search_users, name='search-users'),
]
