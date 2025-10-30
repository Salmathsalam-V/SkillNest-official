from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/community/(?P<community_id>\d+)/meeting/$", consumers.CommunityMeetConsumer.as_asgi()),
    re_path(r"ws/community/(?P<room_uuid>[0-9a-f-]+)/$", consumers.CommunityChatConsumer.as_asgi()),  # community chat

]
