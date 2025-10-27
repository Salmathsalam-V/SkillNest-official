from django.contrib import admin
from .models import   Post,Comment, Course,Community,CommunityInvite,ReportPost,Review


admin.site.register(Post)
admin.site.register(Comment),
admin.site.register(Course),
admin.site.register(Community),
admin.site.register(CommunityInvite)
admin.site.register(ReportPost)
admin.site.register(Review)