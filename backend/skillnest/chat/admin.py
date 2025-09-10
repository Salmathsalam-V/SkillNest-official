from django.contrib import admin
from .models import CommunityChatRoom, CommunityMessage    
# Register your models here.
admin.site.register(CommunityChatRoom)
admin.site.register(CommunityMessage)

