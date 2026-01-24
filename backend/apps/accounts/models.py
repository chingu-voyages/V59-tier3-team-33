from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.core.models import BaseModel

class User(AbstractUser, BaseModel):
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower().strip()
        if self.first_name:
            self.first_name = self.first_name.lower().strip()
        if self.last_name:
            self.last_name = self.last_name.lower().strip()
        super().save(*args, **kwargs)