from django.contrib import admin
from django.urls import path, include



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  
    path('account/', include('accounts.urls')),
    path('api/creator/', include('creator.urls')), 
    path('api/learner/', include('learner.urls')), 
    path('api/admin/', include('Admin.urls')), 
    path('api/chat/', include('chat.urls')),
]