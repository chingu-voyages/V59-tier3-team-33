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

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "trip"], name="unique_user_trip_per_user"
            ),
        ]


# TODO: make tests to make sure constraints are behaving as expected
class TripDay(BaseModel):
    date = models.DateField()
    trip = models.ForeignKey("Trip", on_delete=models.CASCADE, related_name="trip_days")

    def __str__(self):
        return f"{self.trip.name} - {self.date}"

    def normalize_position(self):
        events = self.events.all().order_by(
            models.F("position").asc(nulls_last=True), "position"
        )
        for index, event in enumerate(events, start=1):
            if event.position != index:
                event.position = index
                event.save(update_fields=["position"])

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
    saved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_places",
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["trip", "place"], name="unique_saved_place_per_trip"
            )
        ]


# TODO: make tests to make sure constraints are behaving as expected
class Lodging(BaseModel):
    arrival_date = models.DateField()
    departure_date = models.DateField()
    trip = models.ForeignKey("Trip", on_delete=models.CASCADE, related_name="lodgings")
    place = models.ForeignKey(
        "places.Place", on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        place_name = self.place.name if self.place else "Unknown Place"
        return f"{place_name} ({self.arrival_date} to {self.departure_date})"

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(arrival_date__lte=models.F("departure_date")),
                name="arrival_date_before_departure_date",
            ),
        ]


class Event(BaseModel):
    type = models.CharField(
        max_length=20, choices=EventType.choices, default=EventType.OTHER
    )
    trip_day = models.ForeignKey(
        "TripDay", on_delete=models.CASCADE, related_name="events"
    )
    place = models.ForeignKey(
        "places.Place", on_delete=models.SET_NULL, null=True, blank=True
    )

    # index of order of events in a day
    position = models.PositiveIntegerField()

    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        place_name = self.place.name if self.place else "Unknown Place"
        return f"{place_name} on {self.trip_day.date}"
