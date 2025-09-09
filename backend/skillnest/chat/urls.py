from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'chat'

urlpatterns = [
    # Chat rooms
    path('rooms/', views.ChatRoomListCreateView.as_view(), name='room-list-create'),
    path('rooms/<slug:slug>/', views.ChatRoomDetailView.as_view(), name='room-detail'),
    
    # Room messages and members
    path('rooms/<slug:room_slug>/messages/', views.RoomMessagesView.as_view(), name='room-messages'),
    path('rooms/<slug:room_slug>/members/', views.RoomMembersView.as_view(), name='room-members'),
    path('rooms/<slug:room_slug>/online-users/', views.online_users, name='online-users'),
    
    # Room actions
    path('rooms/<slug:room_slug>/join/', views.join_room, name='join-room'),
    path('rooms/<slug:room_slug>/leave/', views.leave_room, name='leave-room'),
]