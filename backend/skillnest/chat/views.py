# chat/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import ChatRoom, Message, OnlineUser
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