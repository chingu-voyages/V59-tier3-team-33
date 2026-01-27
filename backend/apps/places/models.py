from django.db import models

from apps.core.models import BaseModel
from django.conf import settings


class Place(BaseModel):
    external_id = models.CharField(max_length=255, unique=True)  # id from external API

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, blank=True, null=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="places"
    )

    def __str__(self):
        return self.name
