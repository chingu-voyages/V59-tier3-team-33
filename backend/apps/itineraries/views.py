from rest_framework import viewsets, permissions, mixins
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from .models import Event, Lodging
from .models import Trip, UserTrip, TripDay, TripSavedPlace
from .permissions import IsTripMember
from .serializers import (
    EventReorderSerializer,
    TripDetailSerializer,
    TripSerializer,
    SavePlaceToTripSerializer,
    RemoveSavedPlaceFromTripSerializer,
    EventSerializer,
    LodgingSerializer,
    UpdateLodgingSerializer,
    RouteOptimizationSerializer,
)
from django.db import transaction
from datetime import timedelta
from .services import RouteService


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

    @action(
        detail=False,
        methods=["post"],
        url_path="reorder",
        serializer_class=EventReorderSerializer,
        permission_classes=[permissions.IsAuthenticated, IsTripMember],
    )
    def reorder(self, request, pk=None):
        serializer = self.get_serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        event_ids = serializer.validated_data["event_ids"]
        trip_day = serializer.validated_data["trip_day_id"]
        # Batch Update
        with transaction.atomic():
            events_to_update = []
            events = Event.objects.filter(
                id__in=event_ids,
                trip_day_id=trip_day,
            )
            event_map = {str(e.id): e for e in events}

            for index, event_id in enumerate(event_ids):
                position = index + 1
                event = event_map.get(str(event_id))
                if event:
                    event.position = position
                    events_to_update.append(event)

            Event.objects.bulk_update(events_to_update, ["position"])

        return Response(
            EventSerializer(events_to_update, many=True).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="optimize-route",
        serializer_class=RouteOptimizationSerializer,
        permission_classes=[permissions.IsAuthenticated, IsTripMember],
    )
    def optimize_route(self, request, pk=None, trip_pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trip_day = serializer.validated_data["trip_day_id"]
        route_service = RouteService(trip_day)
        agent, res = route_service.optimize_route()
        parsed_res = self._parse_route_service_response(agent, res)
        if not parsed_res:
            return Response(
                {"error": "Failed to optimize route"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        print(f"Route optimization response: {parsed_res}")
        return Response(parsed_res, status=status.HTTP_200_OK)

    def _parse_route_service_response(self, agent: any, data: dict):
        ordered_ids = []
        if isinstance(agent, Event):
            ordered_ids.append(str(agent.id))

        try:
            features = data.get("features", [])
            feature = features[0] if features else None
            if not feature:
                print("No features found in route service response")
                return None

            props = feature.get("properties", {})
            # TODO: consider implementing route geometry later
            # route_geometry = feature.get("geometry", {})

            total_distance_km = props.get("distance", 0) / 1000
            total_time_hours = props.get("time", 0) / 3600

            for action in props.get("actions", []):
                if action["type"] == "job":
                    # extract job_id (same as event_id provided in the request)
                    event_id = action["job_id"]
                    ordered_ids.append(event_id)

            return {
                "total_distance_km": total_distance_km,
                "total_time_hours": total_time_hours,
                "ordered_ids": ordered_ids,
                # "route_geometry": route_geometry,
            }
        except Exception as e:
            print(f"Error parsing route service response: {e}")
            return None


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
