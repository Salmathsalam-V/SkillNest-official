from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification

def create_notification(sender, recipient, notif_type, post=None):
    notification = Notification.objects.create(
        sender=sender,
        recipient=recipient,
        notif_type=notif_type,
        post=post
    )
    # Send real-time via channel layer
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'notifications_{recipient.id}',
        {
            'type': 'send_notification',
            'content': {
                'id': notification.id,
                'sender': sender.username,
                'type': notif_type,
                'post_id': post.id if post else None,
                'created_at': str(notification.created_at)
            }
        }
    )
