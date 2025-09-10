from django.contrib import admin
from .models import CommunityChatRoom, CommunityMessage, CommunityMessageRead    
# Register your models here.
admin.site.register(CommunityChatRoom)
admin.site.register(CommunityMessage)
admin.site.register(CommunityMessageRead)

