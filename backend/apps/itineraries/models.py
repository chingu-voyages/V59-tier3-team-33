from datetime import timedelta, datetime

from django.db import models
from django.conf import settings

from .constants import EventType
from apps.core.models import BaseModel


class Trip(BaseModel):
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trips"
    )

    def __str__(self):
        return f"{self.name} ({self.start_date} to {self.end_date})"

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(start_date__lte=models.F("end_date")),
                name="start_date_before_end_date",
            )
        ]


class UserTrip(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_trips"
    )
    trip = models.ForeignKey(
        "Trip", on_delete=models.CASCADE, null=True, related_name="user_trips"
    )


# TODO: make tests to make sure constraints are behaving as expected
class TripDay(BaseModel):
    date = models.DateField()
    name = models.CharField(max_length=255, blank=True, null=True)

    trip = models.ForeignKey("Trip", on_delete=models.CASCADE, related_name="trip_days")

    def __str__(self):
        return f"{self.trip.name} - {self.date}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["trip", "date"], name="unique_trip_day_per_trip"
            ),
        ]


class TripSavedPlace(BaseModel):
    trip = models.ForeignKey(
        "Trip", on_delete=models.CASCADE, related_name="saved_places"
    )
    place = models.ForeignKey(
        "places.Place", on_delete=models.CASCADE, related_name="trip_saved_places"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["trip", "place"], name="unique_saved_place_per_trip"
            )
        ]


# TODO: make tests to make sure constraints are behaving as expected
class Lodging(BaseModel):
    name = models.CharField(max_length=255)
    arrival_date = models.DateField()
    departure_date = models.DateField()
    location_text = models.CharField(max_length=255)

    trip = models.ForeignKey("Trip", on_delete=models.CASCADE, related_name="lodgings")
    place = models.ForeignKey(
        "places.Place", on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.arrival_date} to {self.departure_date})"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "trip"], name="unique_lodging_per_trip"
            ),
            models.CheckConstraint(
                condition=models.Q(arrival_date__lte=models.F("departure_date")),
                name="arrival_date_before_departure_date",
            ),
        ]


# TODO: make tests to make sure constraints are behaving as expected
# TODO: consider adding constraint to prevent overlapping events in the same trip day
class Event(BaseModel):
    name = models.CharField(max_length=255)
    type = models.CharField(
        max_length=20, choices=EventType.choices, default=EventType.OTHER
    )
    location_text = models.CharField(max_length=255, blank=True, null=True)
    start_time = models.TimeField(blank=True, null=True)
    duration = models.PositiveIntegerField(blank=True, null=True)  # duration in minutes

    trip_day = models.ForeignKey(
        "TripDay", on_delete=models.CASCADE, related_name="events"
    )
    place = models.ForeignKey(
        "places.Place", on_delete=models.SET_NULL, null=True, blank=True
    )

    position = models.IntegerField(
        blank=True, null=True
    )  # index of order of events in a day

    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} on {self.trip_day.date}"

    def end_time(self):
        if self.start_time is not None and self.duration is not None:
            start_datetime = datetime.combine(datetime.today(), self.start_time)
            return start_datetime + timedelta(minutes=self.duration)
        return None

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["trip_day", "place", "start_time"],
                name="unique_event_per_trip_day",
                condition=models.Q(place__isnull=False, start_time__isnull=False),
            ),
        ]
