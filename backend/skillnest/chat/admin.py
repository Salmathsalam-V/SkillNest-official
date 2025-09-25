from django.contrib import admin
from .models import CommunityChatRoom, CommunityMessage, UserPresence
# Register your models here.
admin.site.register(CommunityChatRoom)
admin.site.register(CommunityMessage)
admin.site.register(UserPresence)