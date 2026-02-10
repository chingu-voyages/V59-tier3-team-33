from django.db import models
from rest_framework import serializers
from datetime import datetime, timedelta
from .models import Trip, UserTrip, TripDay, TripSavedPlace, Event
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


class TripDetailSerializer(TripSerializer):
    total_days = serializers.SerializerMethodField()

    class Meta(TripSerializer.Meta):
        fields = TripSerializer.Meta.fields + ["total_days"]

    def get_total_days(self, obj: Trip):
        return (obj.end_date - obj.start_date).days + 1


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

    def create(self, validated_data):
        # get or create the place using CreatePlaceSerializer
        place_data = validated_data.pop("place")
        place_serializer = CreatePlaceSerializer(data=place_data)
        place_serializer.is_valid(raise_exception=True)
        place = place_serializer.save()

        # Create the TripSavedPlace instance
        validated_data["place"] = place
        try:
            return super().create(validated_data)
        except Exception:
            # If unique constraint fails (trip + place already exists), return existing
            existing = TripSavedPlace.objects.filter(
                trip=validated_data.get("trip"), place=place
            ).first()
            if existing:
                return existing
            raise


class RemoveSavedPlaceFromTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripSavedPlace
        fields = ["id"]
        read_only_fields = ["id"]


class EventSerializer(serializers.ModelSerializer):
    trip_day_pk = serializers.PrimaryKeyRelatedField(
        queryset=TripDay.objects.all(),
        write_only=True,
        source="trip_day"
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
            "start_time",
            "duration",
            "notes",
            "position",
            "type",
        ]
        read_only_fields = ["id", "trip_day", "place_details", "position"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter the queryset dynamically to ensure the user can only select days belonging to the current Trip
        if "trip_pk" in self.context:
            self.fields["trip_day_pk"].queryset = TripDay.objects.filter(
                trip__id=self.context["trip_pk"]
            )

    def validate(self, attrs):
        # Validate start_time and duration logic
        start_time = attrs.get("start_time")
        duration = attrs.get("duration")

        if start_time and duration:
            dummy_date = datetime.today().date()
            start_datetime = datetime.combine(dummy_date, start_time)
            end_datetime = start_datetime + timedelta(minutes=duration)

            if end_datetime.date() > dummy_date:
                raise serializers.ValidationError({"duration": "Event duration extends past midnight."})

        return attrs
        
    def create(self, validated_data):
 
        trip_day = validated_data.pop("trip_day")
        place_data = validated_data.pop("place")
        
        # Handle Place
        place_serializer = CreatePlaceSerializer(data=place_data)
        place_serializer.is_valid(raise_exception=True)
        place = place_serializer.save()
        
        # Create Event
        return Event.objects.create(
            trip_day=trip_day, 
            place=place,
            position=9999 #Temporary position to ensure it's at the end
            **validated_data
        )
        
    def update(self, instance, validated_data):
        # ignore/pop trip_day as it's not allowed to change the day of the event
        if 'trip_day' in validated_data:
            validated_data.pop('trip_day')
        
        if 'place' in validated_data:
            place_data = validated_data.pop('place')
            place_serializer = CreatePlaceSerializer(data=place_data)
            place_serializer.is_valid(raise_exception=True)
            place = place_serializer.save()
            instance.place = place
            
        return super().update(instance, validated_data)