from django.contrib import admin
from .models import   Post,Comment, Course, QA_Post,Community


admin.site.register(Post)
admin.site.register(Comment),
admin.site.register(Course)
admin.site.register(QA_Post)
admin.site.register(Community)
