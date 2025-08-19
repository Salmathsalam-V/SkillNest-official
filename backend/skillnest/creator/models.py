from django.db import models
from accounts.models import Creator, User
import datetime

class Post(models.Model):
    user = models.ForeignKey(Creator, on_delete=models.CASCADE, related_name='posts')  
    image = models.URLField(blank=True, null=True,default=None)
    caption = models.TextField()
    created_at = models.DateTimeField(default=datetime.datetime.now)
    likes = models.ManyToManyField(User, blank=True, related_name='liked_posts')  
    is_cource = models.BooleanField(default=False)

    def like_count(self):
        return self.likes.count()

    def __str__(self):
        return f"Creator: {self.caption}"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.caption}"
    
class Course(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='course')
    rating = models.FloatField(default=0.0)

class QA_Post(models.Model):
    course= models.ForeignKey(Course, on_delete=models.CASCADE, related_name='qa_course')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='qa_course')
    question = models.TextField()
    answer = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Q&A for {self.post.caption}"