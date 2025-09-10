from django.urls import path
from . views import CommunityChatRoomDetailView, CommunityMessagesView, send_community_message, CommunityChatMembersView     

app_name = "chat"

urlpatterns = [
    path("communities/<int:community_id>/chat-room/", CommunityChatRoomDetailView.as_view(), name="community-chat-room"),
    path("communities/<int:community_id>/messages/", CommunityMessagesView.as_view(), name="community-messages"),
    path("communities/<int:community_id>/messages/send/", send_community_message, name="send-community-message"),
    # path("communities/<int:community_id>/messages/<int:message_id>/read/", mark_message_read, name="mark-community-message-read"),
    path("communities/<int:community_id>/members/", CommunityChatMembersView.as_view(), name="community-chat-members"),
]