from django.urls import path
from . import views

urlpatterns = [
    path("test/", views.create_notification, name="test-notification"),
]
