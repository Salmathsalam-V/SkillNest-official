# skillnest/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillnest.settings")

django_asgi_app = get_asgi_application()

# Only import routing modules that don't hit the ORM
from chat import routing as chat_routing
from notification import routing as notif_routing


def get_application():
    # ✅ Lazy-import the JWT middleware so Django is fully set up first
    from chat.middleware import JWTAuthMiddleware

    websocket_patterns = []
    websocket_patterns += notif_routing.websocket_urlpatterns
    websocket_patterns += chat_routing.websocket_urlpatterns

    return ProtocolTypeRouter({
        "http": django_asgi_app,
        "websocket": JWTAuthMiddleware(
            AuthMiddlewareStack(
                URLRouter(websocket_patterns)
            )
        ),
    })


application = get_application()
