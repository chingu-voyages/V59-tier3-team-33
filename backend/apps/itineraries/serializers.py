from django.db import transaction
from rest_framework import serializers
from .models import Trip, TripDay, TripSavedPlace, Event, Lodging
from apps.places.models import Place
from apps.places.serializers import PlaceSerializer, CreatePlaceSerializer
from apps.accounts.serializers import UserSimpleSerializer


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ["id", "name", "start_date", "end_date", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        if attrs["start_date"] > attrs["end_date"]:
            raise serializers.ValidationError("End date must be after start date.")
        return attrs


class SavePlaceToTripSerializer(serializers.ModelSerializer):
    # Write-only nested serializer
    place = CreatePlaceSerializer(write_only=True)

    # Read-only nested serializers
    place_details = PlaceSerializer(source="place", read_only=True)
    saved_by = UserSimpleSerializer(read_only=True)

    class Meta:
        model = TripSavedPlace
        fields = ["id", "trip", "place", "place_details", "saved_by", "created_at"]
        read_only_fields = ["id", "trip", "place_details", "saved_by", "created_at"]
        validators = []

    def create(self, validated_data):
        # get or create the place using CreatePlaceSerializer
        place_data = validated_data.pop("place")

        place, _ = Place.objects.get_or_create(
            external_id=place_data["external_id"], defaults=place_data
        )

        # Get or create TripSavedPlace
        instance, _ = TripSavedPlace.objects.get_or_create(
            trip=validated_data.get("trip"), place=place, defaults=validated_data
        )
        return instance


class RemoveSavedPlaceFromTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripSavedPlace
        fields = ["id"]
        read_only_fields = ["id"]


class EventSerializer(serializers.ModelSerializer):
    trip_day_pk = serializers.PrimaryKeyRelatedField(
        queryset=TripDay.objects.all(), write_only=True, source="trip_day"
    )

    place = CreatePlaceSerializer(write_only=True)
    place_details = PlaceSerializer(source="place", read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "trip_day_pk",
            "trip_day",
            "place",
            "place_details",
            "notes",
            "position",
            "type",
        ]
        read_only_fields = ["id", "trip_day", "place_details", "position"]
        validators = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter the queryset dynamically to ensure the user can only select days belonging to the current Trip
        if "trip_pk" in self.context:
            self.fields["trip_day_pk"].queryset = TripDay.objects.filter(
                trip__id=self.context["trip_pk"]
            )

    def create(self, validated_data):
        trip_day = validated_data.pop("trip_day")
        place_data = validated_data.pop("place")

        place, _ = Place.objects.get_or_create(
            external_id=place_data["external_id"], defaults=place_data
        )

        return Event.objects.create(
            trip_day=trip_day, place=place, position=9999, **validated_data
        )

    def update(self, instance, validated_data):
        # ignore/pop trip_day as it's not allowed to change the day of the event
        if "trip_day" in validated_data:
            validated_data.pop("trip_day")

        if "place" in validated_data:
            place_data = validated_data.pop("place")
            place, _ = Place.objects.get_or_create(
                external_id=place_data["external_id"], defaults=place_data
            )
            instance.place = place

        return super().update(instance, validated_data)


class TripDaySerializer(serializers.ModelSerializer):
    events = EventSerializer(many=True, read_only=True)

    class Meta:
        model = TripDay
        fields = ["id", "trip", "date", "events"]
        read_only_fields = ["id", "trip", "date", "events"]


class TripDetailSerializer(TripSerializer):
    total_days = serializers.SerializerMethodField()
    trip_days = TripDaySerializer(many=True, read_only=True)

    class Meta(TripSerializer.Meta):
        fields = TripSerializer.Meta.fields + ["total_days", "trip_days"]

    def get_total_days(self, obj: Trip):
        return (obj.end_date - obj.start_date).days + 1


class UpdateLodgingSerializer(serializers.ModelSerializer):
    place_details = PlaceSerializer(source="place", read_only=True)

    class Meta:
        model = Lodging
        fields = ["id", "trip", "arrival_date", "departure_date", "place_details"]
        read_only_fields = ["id", "trip", "place_details"]

    def validate(self, attrs):
        # Validate arrival_date and departure_date
        arrival_date = attrs.get("arrival_date")
        departure_date = attrs.get("departure_date")
        # Ensure date range is within the trip
        trip = Trip.objects.get(id=self.context["trip_pk"])
        if arrival_date and departure_date:
            if arrival_date >= departure_date:
                raise serializers.ValidationError(
                    {"departure_date": "Departure date must be after arrival date."}
                )
            if arrival_date < trip.start_date or departure_date > trip.end_date:
                raise serializers.ValidationError(
                    {"date_range": "Lodging dates must be within the trip duration."}
                )
        return attrs


class LodgingSerializer(UpdateLodgingSerializer):
    place = CreatePlaceSerializer(write_only=True)

    class Meta(UpdateLodgingSerializer.Meta):
        fields = UpdateLodgingSerializer.Meta.fields + ["place"]
        validators = []

    def create(self, validated_data):
        with transaction.atomic():
            # get or create the place using CreatePlaceSerializer
            place_data = validated_data.pop("place")
            place, _ = Place.objects.get_or_create(
                external_id=place_data["external_id"], defaults=place_data
            )

            # Check for overlapping lodging and delete
            trip = Trip.objects.get(id=self.context["trip_pk"])
            arrival_date = validated_data["arrival_date"]
            departure_date = validated_data["departure_date"]

            overlapping_lodgings = Lodging.objects.filter(
                trip=trip,
                arrival_date__lte=departure_date,
                departure_date__gte=arrival_date,
            )

            if overlapping_lodgings.exists():
                overlapping_lodgings.delete()

            # Create new lodging
            instance = Lodging.objects.create(trip=trip, place=place, **validated_data)

            return instance


class EventReorderSerializer(serializers.Serializer):
    event_ids = serializers.ListField(
        child=serializers.UUIDField(),
        help_text="List of event IDs in the desired order.",
    )
    trip_day_id = serializers.PrimaryKeyRelatedField(
        queryset=TripDay.objects.all(),
        help_text="ID of the trip day to reorder events for.",
    )

    class Meta:
        fields = ["event_ids", "trip_day_id"]

    def __init__(self, instance=None, data=..., **kwargs):
        super().__init__(instance, data, **kwargs)
        trip_pk = self.context["trip_pk"]
        if trip_pk:
            self.fields["trip_day_id"].queryset = self.fields[
                "trip_day_id"
            ].queryset.filter(trip=self.context["trip_pk"])

    def validate(self, attrs):
        event_ids = attrs.get("event_ids")
        trip_day = attrs.get("trip_day_id")

        # Check if all event IDs exist
        events_count = Event.objects.filter(id__in=event_ids, trip_day=trip_day).count()

        if events_count != len(event_ids):
            raise serializers.ValidationError("One or more event IDs do not exist.")

        return attrs


class RouteOptimizationSerializer(serializers.Serializer):
    trip_day_id = serializers.PrimaryKeyRelatedField(queryset=TripDay.objects.all())

    class Meta:
        fields = ["trip_day_id"]

    def __init__(self, instance=None, data=..., **kwargs):
        super().__init__(instance, data, **kwargs)
        trip_pk = self.context["trip_pk"]
        if trip_pk:
            self.fields["trip_day_id"].queryset = self.fields[
                "trip_day_id"
            ].queryset.filter(trip=self.context["trip_pk"])

    def validate(self, attrs):
        trip_day = attrs.get("trip_day_id")

        # Check if the trip day has events or lodging
        lodging_exists = trip_day.trip.lodgings.filter(
            arrival_date__lte=trip_day.date,
            departure_date__gte=trip_day.date,
        ).exists()
        events_count_valid = trip_day.events.count() > (2 if not lodging_exists else 1)

        if not events_count_valid:
            raise serializers.ValidationError(
                "Trip day must have at least 3 events or 2 events with a lodging to optimize the route."
            )

        return attrs
