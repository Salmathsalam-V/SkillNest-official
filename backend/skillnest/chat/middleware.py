# chat/middleware.py
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from accounts.models import User
from jwt import decode as jwt_decode
from django.conf import settings


@database_sync_to_async
def get_user_from_token(token):
    try:
        UntypedToken(token)  # validate token
        decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_data.get("user_id")
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return JWTAuthMiddlewareInstance(scope, self.inner)

class JWTAuthMiddlewareInstance:
    def __init__(self, scope, inner):
        self.scope = dict(scope)
        self.inner = inner

    async def __call__(self, receive, send):
        # Extract token from cookie headers
        headers = dict(self.scope["headers"])
        cookies = {}
        if b"cookie" in headers:
            cookie_header = headers[b"cookie"].decode()
            for part in cookie_header.split(";"):
                if "=" in part:
                    k, v = part.strip().split("=", 1)
                    cookies[k] = v

        token = cookies.get("access_token")

        if token:
            self.scope["user"] = await get_user_from_token(token)
        else:
            self.scope["user"] = AnonymousUser()

        inner = self.inner(self.scope)
        return await inner(receive, send)
