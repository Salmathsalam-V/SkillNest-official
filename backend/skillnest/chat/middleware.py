import logging
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)
User = get_user_model()

@database_sync_to_async
def get_user_from_token(token: str):
    """
    Decode the JWT access token and return the matching user,
    or None if token is invalid/expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        data=User.objects.get(id=payload["user_id"])
        return User.objects.get(id=payload["user_id"])
    except Exception as e:
        return None


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom Channels middleware that authenticates a WebSocket
    connection using the 'access_token' cookie.
    """

    async def __call__(self, scope, receive, send):
        try:
            # Headers arrive as a list of [key, value] byte pairs
            headers = dict(scope.get("headers", []))
            cookies = {}
            # Grab the Cookie header if present
            if b"cookie" in headers:
                cookie_header = headers[b"cookie"].decode()
                for pair in cookie_header.split(";"):
                    if "=" in pair:
                        name, value = pair.strip().split("=", 1)
                        cookies[name] = value


            token = cookies.get("access_token")
            user = await get_user_from_token(token) if token else None
            scope["user"] = user or AnonymousUser()   # <-- always set a user
        except Exception as e:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)


# # chat/middleware.py
# from urllib.parse import parse_qs
# from django.contrib.auth.models import AnonymousUser
# from channels.db import database_sync_to_async
# from rest_framework_simplejwt.tokens import UntypedToken
# from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
# from accounts.models import User
# from jwt import decode as jwt_decode
# from django.conf import settings


# @database_sync_to_async
# def get_user_from_token(token):
#     try:
#         UntypedToken(token)  # validate token
#         decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
#         user_id = decoded_data.get("user_id")
#         return User.objects.get(id=user_id)
#     except (InvalidToken, TokenError, User.DoesNotExist):
#         return AnonymousUser()

# class JWTAuthMiddleware:
#     def __init__(self, inner):
#         self.inner = inner

#     def __call__(self, scope):
#         return JWTAuthMiddlewareInstance(scope, self.inner)

# class JWTAuthMiddlewareInstance:
#     def __init__(self, scope, inner):
#         self.scope = dict(scope)
#         self.inner = inner

#     async def __call__(self, receive, send):
#         # Extract token from cookie headers
#         headers = dict(self.scope["headers"])
#         cookies = {}
#         if b"cookie" in headers:
#             cookie_header = headers[b"cookie"].decode()
#             for part in cookie_header.split(";"):
#                 if "=" in part:
#                     k, v = part.strip().split("=", 1)
#                     cookies[k] = v

#         token = cookies.get("access_token")

#         if token:
#             self.scope["user"] = await get_user_from_token(token)
#         else:
#             self.scope["user"] = AnonymousUser()

#         inner = self.inner(self.scope)
#         return await inner(receive, send)