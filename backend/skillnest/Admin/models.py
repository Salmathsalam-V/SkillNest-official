from django.db import models
from accounts.models import Creator, User
import datetime

class ContactUs(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contact_us')  
    content = models.TextField()
    created_at = models.DateTimeField(default=datetime.datetime.now)

    # Admin reply
    reply = models.TextField(blank=True, null=True)
    replied_at = models.DateTimeField(blank=True, null=True)
    is_replied = models.BooleanField(default=False)
