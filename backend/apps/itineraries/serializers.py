from django.core import validators
from django.db import models, transaction
from rest_framework import serializers
from datetime import datetime, timedelta
from .models import Trip, UserTrip, TripDay, TripSavedPlace, Event, Lodging
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
             external_id=place_data['external_id'],
             defaults=place_data
        )
        
        # Get or create TripSavedPlace
        instance, _ = TripSavedPlace.objects.get_or_create(
            trip=validated_data.get("trip"),
            place=place,
            defaults=validated_data
        )
        return instance


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
        fields = ["id", "trip_day_pk", "trip_day", "place", "place_details", "start_time", "duration", "notes", "position", "type",]
        read_only_fields = ["id", "trip_day", "place_details", "position"]
        validators = []

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
        trip_day = attrs.get("trip_day")

        if start_time and duration:
            dummy_date = datetime.today().date()
            start_datetime = datetime.combine(dummy_date, start_time)
            end_datetime = start_datetime + timedelta(minutes=duration)

            if end_datetime.date() > dummy_date:
                raise serializers.ValidationError({"duration": "Event duration extends past midnight."})
            
            # Check for overlapping events
            if trip_day and hasattr(trip_day, 'pk'):
                end_time = (datetime.combine(dummy_date, start_time) + timedelta(minutes=duration)).time()
                
                overlapping_events = Event.objects.filter(
                    trip_day=trip_day,
                    start_time__lt=end_time,
                    start_time__isnull=False
                ).exclude(
                    start_time=start_time
                ).annotate(
                    event_end_time=models.ExpressionWrapper(
                        models.F('start_time') + models.ExpressionWrapper(
                            models.F('duration') * timedelta(minutes=1),
                            output_field=models.TimeField()
                        ),
                        output_field=models.TimeField()
                    )
                ).filter(
                    event_end_time__gt=start_time
                )
                
                if overlapping_events.exists():
                    raise serializers.ValidationError({
                        "start_time": "Event time conflicts with existing events."
                    })

        return attrs
        
    def create(self, validated_data):
 
        trip_day = validated_data.pop("trip_day")
        place_data = validated_data.pop("place")
        
        place, _ = Place.objects.get_or_create(
             external_id=place_data['external_id'],
             defaults=place_data
        )

        return Event.objects.create(
            trip_day=trip_day, 
            place=place,
            position=9999, 
            **validated_data
        )
        
    def update(self, instance, validated_data):
        # ignore/pop trip_day as it's not allowed to change the day of the event
        if 'trip_day' in validated_data:
            validated_data.pop('trip_day')
        
        if 'place' in validated_data:
            place_data = validated_data.pop('place')
            place, _ = Place.objects.get_or_create(
                external_id=place_data['external_id'],
                defaults=place_data
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
                raise serializers.ValidationError({"departure_date": "Departure date must be after arrival date."})
            if arrival_date < trip.start_date or departure_date > trip.end_date:
                raise serializers.ValidationError({"date_range": "Lodging dates must be within the trip duration."})
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
                external_id=place_data['external_id'],
                defaults=place_data
            )
            
            # Check for overlapping lodging and delete
            trip = Trip.objects.get(id=self.context["trip_pk"])
            arrival_date = validated_data["arrival_date"]
            departure_date = validated_data["departure_date"]
            
            overlapping_lodgings = Lodging.objects.filter(
                trip=trip,
                arrival_date__lte=departure_date,
                departure_date__gte=arrival_date
            )
            
            if overlapping_lodgings.exists():
                overlapping_lodgings.delete()
            
            # Create new lodging
            instance = Lodging.objects.create(
                trip=trip,
                place=place,
                **validated_data
            )
            
            return instance
      