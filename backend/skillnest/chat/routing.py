from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # re_path(r"ws/chat/(?P<room_slug>\w+)/$", consumers.ChatConsumer.as_asgi()),   # private/group chat
    re_path(r"ws/community/(?P<room_uuid>[0-9a-f-]+)/$", consumers.CommunityChatConsumer.as_asgi()),  # community chat
]
