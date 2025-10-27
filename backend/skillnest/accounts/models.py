from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    fullname = models.CharField(max_length=255)
    status = models.BooleanField(default=False)
    profile = models.URLField(blank=True, null=True)
    is_block = models.BooleanField(default=False)
    is_delete = models.BooleanField(default=False)
    USER_TYPE_CHOICES = (
        ('learner', 'Learner'),
        ('creator', 'Creator'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.email


class Creator(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='creator_profile')
    category = models.CharField(max_length=100)
    description = models.TextField()
    publicProfile1 = models.URLField(blank=True, null=True)
    publicProfile2 = models.URLField(blank=True, null=True)
    background = models.URLField(blank=True, null=True)
    followers = models.ManyToManyField('User', symmetrical=False, blank=True, related_name='following')
    APPROVE_CHOICES = [
        ('pending', 'Pending'),
        ('accept', 'Accepted'),
        ('reject', 'Rejected'),
    ]
    approve = models.CharField(max_length=20, choices=APPROVE_CHOICES, default='pending')
    
    def follower_count(self):
        return self.followers.count()

    def __str__(self):
        return f"Creator: {self.user.username}"

