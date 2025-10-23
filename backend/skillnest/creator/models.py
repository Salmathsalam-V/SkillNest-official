from django.db import models
from django.shortcuts import get_object_or_404
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

class ReportPost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reports')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_posts')
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def perform_create(self, serializer):
        """Attach the post and user when creating a report"""
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id)
        serializer.save(post=post, reported_by=self.request.user)
        
    def __str__(self):
        return f"Report by {self.reported_by.username} on Post {self.post.id}"

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
    
class CommunityInvite(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="invites")
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_invites")
    invited_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_invites")
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("accepted", "Accepted"), ("declined", "Declined")],
        default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Invite to {self.invited_user.email} for {self.community.name} by {self.invited_by.email}"