from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ]
    email = models.EmailField(unique=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')
    is_premium = models.BooleanField(default=False)

    def __str__(self):
        return self.username
