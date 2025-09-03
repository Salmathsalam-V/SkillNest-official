from django.contrib import admin
from django.urls import path, include
from accounts.views import LoginView, RegisterView,ProtectedView, RefreshTokenView,LogoutView,GoogleLoginAPIView,send_otp_view,verify_otp_view,reset_password_view,ProfileView,CreatorCreateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from creator.views import PostView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  
    path('account/', include('accounts.urls')),
    path('api/creator/', include('creator.urls')), 
    path('api/admin/', include('Admin.urls')), 
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/protected/', ProtectedView.as_view(), name='protected_view'),
    path('api/post/', PostView.as_view(),name='post'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/google-login/', GoogleLoginAPIView.as_view(), name='google-login'),
    path('api/send_otp/',send_otp_view, name='sent-otp'),
    path('api/verify_otp/', verify_otp_view, name='verify-otp'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/reset_password/', reset_password_view, name='reset_password'),
    path('api/create-creator/', CreatorCreateView.as_view(), name='create-creator'),
]