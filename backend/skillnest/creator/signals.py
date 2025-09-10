from creator.models import Community
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from chat.models import CommunityChatRoom

@receiver(post_save, sender=Community)
def create_community_chatroom(sender, instance, created, **kwargs):
    """
    Automatically create a chat room when a new community is created.
    """
    if created:
        chat_room = CommunityChatRoom.objects.create(
            community=instance,
            name=instance.name,
            description=instance.description,
            created_by=instance.creator
        )
        # Add creator and initial members
        chat_room.members.add(instance.creator, *instance.members.all())


@receiver(m2m_changed, sender=Community.members.through)
def sync_chatroom_members(sender, instance, action, pk_set, **kwargs):
    """
    Keep chatroom members in sync with community members.
    """
    try:
        chat_room = instance.chat_room
    except CommunityChatRoom.DoesNotExist:
        return

    if action == "post_add":
        # Add new members to chatroom
        chat_room.members.add(*pk_set)
    elif action == "post_remove":
        # Remove members from chatroom
        chat_room.members.remove(*pk_set)
    elif action == "post_clear":
        # Clear all members if community is cleared
        chat_room.members.clear()