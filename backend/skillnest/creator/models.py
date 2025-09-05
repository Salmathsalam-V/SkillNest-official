from django.db import models
from accounts.models import Creator, User
import datetime

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')  
    image = models.URLField(blank=True, null=True,default=None)
    caption = models.TextField()
    created_at = models.DateTimeField(default=datetime.datetime.now)
    likes = models.ManyToManyField(User, blank=True, related_name='liked_posts')  
    is_course = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.user.user_type != "creator":
            raise ValueError("Only creators can create posts.")
        super().save(*args, **kwargs)
    def like_count(self):
        return self.likes.count()

    def __str__(self):
        return f"Creator: {self.caption}"

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name="liked_comments")

    def like_count(self):
        return self.likes.count()
    # # New: replies
    # parent = models.ForeignKey(
    #     "self",
    #     null=True,
    #     blank=True,
    #     on_delete=models.CASCADE,
    #     related_name="replies"
    # )

    # def is_reply(self):
    #     return self.parent is not None

    def __str__(self):
        # if self.parent:
        #     return f"Reply by {self.user.username} to comment {self.parent.id}"
        return f"Comment by {self.user.username} on {self.post.caption}"

    
class Course(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course',default=1)  
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='course')
    rating = models.FloatField(default=0.0)
    def save(self, *args, **kwargs):
        if self.user.user_type != "creator":
            raise ValueError("Only creators can create posts.")
        super().save(*args, **kwargs)

class QA_Post(models.Model):
    course= models.ForeignKey(Course, on_delete=models.CASCADE, related_name='qa_course')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='qa_course')
    question = models.TextField()
    answer = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Q&A for {self.course.post.caption} by {self.user.username}"


# Community
class Community(models.Model):
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_communities",
        limit_choices_to={'user_type': 'creator'} 
    )
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    members = models.ManyToManyField(
        User,
        related_name="communities",
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name