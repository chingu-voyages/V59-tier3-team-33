from django.contrib import admin

from apps.itineraries.models import Event, Lodging, Trip, TripDay, TripSavedPlace

# Register your models here.
admin.site.register(Event)
admin.site.register(Lodging)
admin.site.register(Trip)
admin.site.register(TripDay)
admin.site.register(TripSavedPlace)
