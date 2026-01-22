from django.db import models


class EventType(models.TextChoices):
    FLIGHT = "FLIGHT", "Flight"
    TRAIN = "TRAIN", "Train"
    BUS = "BUS", "Bus"
    MEAL = "MEAL", "Meal"
    ACTIVITY = "ACTIVITY", "Activity"
    OTHER = "OTHER", "Other"
