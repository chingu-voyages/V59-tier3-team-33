from apps.places.serializers import PlaceSerializer
from rest_framework import serializers
from .models import Trip, TripSavedPlace, UserTrip, TripDay

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

class TripSavedPlaceSerializer(serializers.ModelSerializer):
    # TODO: Wire into viewset/actions when saved-place endpoints are implemented.
    place = PlaceSerializer()
    
    class Meta:
        model = TripSavedPlace
        fields = ["id", "trip", "place", "saved_by", "created_at"]
        read_only_fields = ["id", "created_at"]
        
# /trips/{id}/saved-places (favorite places)
# /trips/{id}/trip-days (for overview)
# /trips/{id}/trip-days/{day_id} (for day details)
# /trips/{id}/trip-days/{day_id}/events (for events of the specific day)
# /trips/{id}/trip-days/{day_id}/events/{event_id} (for event details)
