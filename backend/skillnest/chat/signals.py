
# chat/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from creator.models import Community
from .models import CommunityChatRoom

@receiver(post_save, sender=Community)
def create_chat_room(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "chat_room"):
        CommunityChatRoom.objects.create(
            community=instance,
            name=instance.name,
            created_by=getattr(instance, "creator", None) or instance.creator
        )
