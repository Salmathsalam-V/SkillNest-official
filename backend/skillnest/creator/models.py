from django.db import models
from accounts.models import Creator, User

class Post(models.Model):
    user = models.ForeignKey(Creator, on_delete=models.CASCADE, related_name='posts')  # Changed from OneToOne
    caption = models.TextField()
    post = models.URLField(blank=True, null=True)
    likes = models.ManyToManyField(User, blank=True, related_name='liked_posts')  # Fixed field

    def like_count(self):
        return self.likes.count()

    def __str__(self):
        return f"Creator: {self.caption}"
