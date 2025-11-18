from django.urls import path
from . views import CommunityChatRoomDetailView, CommunityMessagesView, send_community_message, CommunityChatMembersView, CreateMeetingRoomView,ActiveMeetingView     
from .views import translate_text,unread_message_count,mark_as_read
app_name = "chat"

urlpatterns = [
    path("communities/<int:community_id>/chat-room/", CommunityChatRoomDetailView.as_view(), name="community-chat-room"),
    path("communities/<int:community_id>/messages/", CommunityMessagesView.as_view(), name="community-messages"),
    path("communities/<int:community_id>/messages/send/", send_community_message, name="send-community-message"),
    # path("communities/<int:community_id>/messages/<int:message_id>/read/", mark_message_read, name="mark-community-message-read"),
    path("communities/<int:community_id>/members/", CommunityChatMembersView.as_view(), name="community-chat-members"),
    path("create/meet-room/", CreateMeetingRoomView.as_view(), name="create-room"),
    path("active-meeting/<int:community_id>/", ActiveMeetingView.as_view(), name="active-meeting"),
    path("translate/", translate_text,name="translate-text"), 
    path("community/<uuid:room_uuid>/unread_count", unread_message_count,name="unread-message-count"), 
    path("community/<uuid:room_uuid>/mark_as_read/", mark_as_read,name="mark-as-read"), 
]