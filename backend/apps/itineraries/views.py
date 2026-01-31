from rest_framework import viewsets, permissions
from .models import Trip, UserTrip, TripDay
from .serializers import TripSerializer
from django.db import transaction
from datetime import timedelta

class TripViewset(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Trip.objects.filter(user_trips__user=self.request.user)
    
    def perform_create(self, serializer):
        with transaction.atomic():
            # Save Trip Record
            trip = serializer.save(user=self.request.user)
            # Save UserTrip Record (Even if it's redundant)
            UserTrip.objects.create(user=self.request.user, trip=trip)
            # Sync TripDay Records
            self._sync_trip_days(trip)
            
    def perform_update(self, serializer):
        with transaction.atomic():
            # Save Trip Record
            trip = serializer.save()
            # Sync TripDay Records
            self._sync_trip_days(trip)
            
    def _sync_trip_days(self, trip: Trip):
        # Delete TripDay records that are no longer in the date range of the Trip
        TripDay.objects.filter(trip=trip).exclude(date__range=(trip.start_date, trip.end_date)).delete()
        # List missing dates and existing dates
        existing_dates = set(TripDay.objects.filter(trip=trip).values_list("date", flat=True))
        missing_dates = []
        
        start_date = trip.start_date
        while start_date <= trip.end_date:
            if start_date not in existing_dates:
                missing_dates.append(TripDay(trip=trip, date=start_date))
            start_date += timedelta(days=1)
        
        if missing_dates:
            TripDay.objects.bulk_create(missing_dates)
            
    # TODO: Add an action endpoint to manage users who can collaborate on a trip (Nice-To-Have)
        
