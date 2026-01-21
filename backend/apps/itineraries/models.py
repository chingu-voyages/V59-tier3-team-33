from django.db import models

from backend.config import settings

from datetime import timedelta, datetime

#TODO: review event types and add/remove as needed
class EventType(models.TextChoices):
    FLIGHT = 'FLIGHT', 'Flight'
    TRAIN = 'TRAIN', 'Train'
    BUS = 'BUS', 'Bus'
    MEAL = 'MEAL', 'Meal'
    ACTIVITY = 'ACTIVITY', 'Activity'
    OTHER = 'OTHER', 'Other'


class Trip(models.Model):
    
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trips'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.start_date} to {self.end_date})"
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                condition = models.Q(start_date__lte=models.F('end_date')),
                name = 'start_date_before_end_date'
            )
        ]
    
class UserTrip(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_trips'
    )
    trip = models.ForeignKey(
        'Trip',
        on_delete=models.CASCADE,
        null=True,
        related_name='user_trips'
    )
    
#TODO: make tests to make sure constraints are behaving as expected
class TripDay(models.Model):
    date = models.DateField()
    name = models.CharField(max_length=255, blank=True, null=True)
    
    trip = models.ForeignKey(
        'Trip', 
        on_delete=models.CASCADE, 
        related_name='trip_days'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.trip.name} - {self.date}"
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['trip', 'date'],
                name='unique_trip_day_per_trip'
            ),
            models.CheckConstraint(
                condition=
                models.Q(date__gte=models.F('trip__start_date')) &
                models.Q(date__lte=models.F('trip__end_date')),
                name='date_within_trip_dates'
            )
        ]

#TODO: make tests to make sure constraints are behaving as expected
class Lodging(models.Model):
    name = models.CharField(max_length=255)
    arrival_date = models.DateField()
    departure_date = models.DateField()
    location_text = models.CharField(max_length=255)

    trip = models.ForeignKey(
        'Trip', 
        on_delete=models.CASCADE, 
        related_name='lodgings'
    )
    place = models.ForeignKey(
        'Place', 
        on_delete=models.SET_NULL, 
        null=True, blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.arrival_date} to {self.departure_date})"
    
    class Meta:
        constraints = [
            models.uniqueConstraint(
                fields=['name', 'trip'],
            ),
            models.CheckConstraint(
                condition = models.Q(arrival_date__lte=models.F('departure_date')),
                name = 'arrival_date_before_departure_date'
            ),
            models.CheckConstraint(
                condition= 
                models.Q(arrival_date__gte=models.F('trip__start_date')) &
                models.Q(departure_date__lte=models.F('trip__end_date')),
                name = 'lodging_dates_within_trip_dates'
            )
        ]

#TODO: make tests to make sure constraints are behaving as expected
#TODO: consider adding constraint to prevent overlapping events in the same trip day
class Event(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(
        max_length=20,
        choices=EventType.choices,
        default=EventType.OTHER
    )
    location_text = models.CharField(max_length=255, blank=True, null=True)
    start_time = models.TimeField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True) # duration in minutes

    trip_day = models.ForeignKey(
        'TripDay', 
        on_delete=models.CASCADE, 
        related_name='events'
    )
    place = models.ForeignKey(
        'Place', 
        on_delete=models.SET_NULL, 
        null=True, blank=True
    )

    position = models.IntegerField(blank=True, null=True) # index of order of events in a day
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} on {self.trip_day.date}"
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(start_time__lte=models.F('end_time')),
                name='event_start_time_before_end_time'
            ),
            models.CheckConstraint(
                condition=models.Q(duration=models.F('end_time') - models.F('start_time')),
                name='event_duration_consistency'
            )
        ]
        
    def end_time(self):
        if self.start_time and self.duration is not None:
            return self.start_time + timedelta(minutes=self.duration)
        return None

    
