# chat/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
# from .models import ChatRoom, Message, OnlineUser
from django.db.models import Count

@login_required
def index(request):
    rooms = ChatRoom.objects.annotate(
        message_count=Count('messages'),
        online_users=Count('onlineuser')
    ).order_by('-created_at')
    
    context = {
        'rooms': rooms
    }
    return render(request, 'chat/index.html', context)

@login_required
def room(request, room_name):
    room = get_object_or_404(ChatRoom, name=room_name)
    
    # Get recent messages
    recent_messages = Message.objects.filter(room=room).select_related('user').order_by('-timestamp')[:50]
    recent_messages = reversed(recent_messages)
    
    # Get online users
    online_users = OnlineUser.objects.filter(room=room).select_related('user')
    
    context = {
        'room': room,
        'room_name_json': room_name,
        'recent_messages': recent_messages,
        'online_users': online_users,
    }
    return render(request, 'chat/room.html', context)

@login_required
def create_room(request):
    if request.method == 'POST':
        room_name = request.POST.get('room_name', '').strip()
        room_description = request.POST.get('room_description', '').strip()
        
        if room_name:
            if not ChatRoom.objects.filter(name=room_name).exists():
                ChatRoom.objects.create(
                    name=room_name,
                    description=room_description,
                    created_by=request.user
                )
                messages.success(request, f'Room "{room_name}" created successfully!')
                return redirect('chat:room', room_name=room_name)
            else:
                messages.error(request, 'Room name already exists!')
        else:
            messages.error(request, 'Room name is required!')
    
    return render(request, 'chat/create_room.html')

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ChatRoom, Message, UserPresence
from .serializers import ChatRoomSerializer, MessageSerializer, UserPresenceSerializer

class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class ChatRoomListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            Q(room_type='public') | Q(members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        room = serializer.save(created_by=self.request.user)
        # Add creator as member
        room.members.add(self.request.user)

class ChatRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            Q(room_type='public') | Q(members=user)
        ).distinct()

class RoomMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagePagination
    
    def get_queryset(self):
        room_slug = self.kwargs['room_slug']
        room = get_object_or_404(ChatRoom, slug=room_slug)
        
        # Check if user has access to this room
        user = self.request.user
        if room.room_type != 'public' and not room.members.filter(id=user.id).exists():
            return Message.objects.none()
        
        return Message.objects.filter(room=room).select_related('sender', 'reply_to__sender')

class RoomMembersView(generics.ListAPIView):
    serializer_class = UserPresenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        room_slug = self.kwargs['room_slug']
        room = get_object_or_404(ChatRoom, slug=room_slug)
        
        # Check access
        user = self.request.user
        if room.room_type != 'public' and not room.members.filter(id=user.id).exists():
            return UserPresence.objects.none()
        
        return UserPresence.objects.filter(
            user__in=room.members.all()
        ).select_related('user')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_room(request, room_slug):
    room = get_object_or_404(ChatRoom, slug=room_slug)
    
    if room.room_type == 'private':
        return Response(
            {'error': 'Cannot join private room without invitation'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    room.members.add(request.user)
    return Response({'message': 'Successfully joined the room'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_room(request, room_slug):
    room = get_object_or_404(ChatRoom, slug=room_slug)
    room.members.remove(request.user)
    return Response({'message': 'Successfully left the room'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def online_users(request, room_slug):
    room = get_object_or_404(ChatRoom, slug=room_slug)
    
    # Check access
    if room.room_type != 'public' and not room.members.filter(id=request.user.id).exists():
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    online_users = UserPresence.objects.filter(
        user__in=room.members.all(),
        is_online=True
    ).select_related('user')
    
    serializer = UserPresenceSerializer(online_users, many=True)
    return Response(serializer.data)