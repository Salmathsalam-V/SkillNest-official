import os
from django.conf import settings
from .zego_server_assistant import token04  # ensure path is correct
import logging
logger = logging.getLogger(__name__)

ZEGO_APP_ID = 1551231778
ZEGO_SERVER_SECRET = 'b5760c71682586e629b772f8fa71570f'
print("app id:",ZEGO_APP_ID,ZEGO_SERVER_SECRET)
def generate_zego_token(user_id: str, room_id: str):
    effective_time_in_seconds = 3600

    payload = {
        "room_id": room_id,
        "user_id": user_id,
        "privilege": {1: 1, 2: 1},  # login & publish allowed
        "stream_id_list": [],
    }

    token_info = token04.generate_token04(
        app_id=ZEGO_APP_ID,
        user_id=user_id,
        secret=ZEGO_SERVER_SECRET,
        effective_time_in_seconds=effective_time_in_seconds,
        payload=payload,
    )

    # 🧩 Debug output — check if generation succeeded
    print("Token info: info token",token_info.token," info", token_info.error_message )

    # ✅ Return only the token string
    return token_info.token
