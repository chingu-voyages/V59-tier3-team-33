from rest_framework import viewsets, permissions, mixins
from django.shortcuts import get_object_or_404

from .models import Event, Lodging
from .models import Trip, UserTrip, TripDay, TripSavedPlace
from .permissions import IsTripMember
from .serializers import (
    TripDetailSerializer,
    TripSerializer,
    SavePlaceToTripSerializer,
    RemoveSavedPlaceFromTripSerializer,
    EventSerializer,
    LodgingSerializer,
    UpdateLodgingSerializer,
)
from django.db import transaction
from datetime import timedelta


class TripViewset(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["retrieve"]:
            return TripDetailSerializer
        return TripSerializer

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
        TripDay.objects.filter(trip=trip).exclude(
            date__range=(trip.start_date, trip.end_date)
        ).delete()
        # List missing dates and existing dates
        existing_dates = set(
            TripDay.objects.filter(trip=trip).values_list("date", flat=True)
        )
        missing_dates = []

        start_date = trip.start_date
        while start_date <= trip.end_date:
            if start_date not in existing_dates:
                missing_dates.append(TripDay(trip=trip, date=start_date))
            start_date += timedelta(days=1)

        if missing_dates:
            TripDay.objects.bulk_create(missing_dates)

    # TODO: Add an action endpoint to manage users who can collaborate on a trip (Nice-To-Have)


class TripSavedPlaceViewset(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
):
    queryset = TripSavedPlace.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsTripMember]

    def get_serializer_class(self):
        if self.action == "destroy":
            return RemoveSavedPlaceFromTripSerializer
        return SavePlaceToTripSerializer

    def get_queryset(self):
        return super().get_queryset().filter(trip=self.kwargs["trip_pk"])

    def perform_create(self, serializer):
        trip = get_object_or_404(Trip, pk=self.kwargs["trip_pk"])
        serializer.save(
            trip=trip,
            saved_by=self.request.user,
        )

class TripEventViewset(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated, IsTripMember]

    def get_queryset(self):
        return super().get_queryset().filter(trip_day__trip=self.kwargs["trip_pk"])
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["trip_pk"] = self.kwargs["trip_pk"]
        return context
    
    def perform_create(self, serializer):
        with transaction.atomic():
            instance = serializer.save()
            instance.trip_day.normalize_position()
    
    def perform_update(self, serializer):
        with transaction.atomic():
            instance = serializer.save()
            instance.trip_day.normalize_position()
    
    def perform_destroy(self, instance):
        with transaction.atomic():
            trip_day = instance.trip_day
            instance.delete()
            trip_day.normalize_position()


class TripLodgingViewset(viewsets.ModelViewSet):
    queryset = Lodging.objects.all()
    serializer_class = LodgingSerializer
    permission_classes = [permissions.IsAuthenticated, IsTripMember]

    def get_queryset(self):
        return super().get_queryset().filter(trip=self.kwargs["trip_pk"])
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["trip_pk"] = self.kwargs["trip_pk"]
        return context
    
    def get_serializer_class(self):
        if self.action in ["update"]:
            return UpdateLodgingSerializer
        return LodgingSerializer
