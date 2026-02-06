from rest_framework import serializers
from .models import Trip, UserTrip, TripDay, TripSavedPlace
from apps.places.models import Place

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
    
    # Write-only fields to receive the place data
    external_id = serializers.CharField(max_length=255, write_only=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, write_only=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, write_only=True)
    name = serializers.CharField(max_length=255, write_only=True)
    address = serializers.CharField(max_length=255, write_only=True)    
    # Read-only fields to return the nested place data
    place_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TripSavedPlace
        fields = ["id", "trip", "external_id", "latitude", "longitude", "name", "address", "place_details"]
        read_only_fields = ["id", "trip", "place_details"]

    def get_place_details(self, obj):
        return {
            "name": obj.place.name,
            "address": obj.place.address,
            "latitude": obj.place.latitude,
            "longitude": obj.place.longitude,
            "external_id": obj.place.external_id
        }

    def create(self, validated_data):
        # Extract place-related data
        external_id = validated_data.pop("external_id")
        name = validated_data.pop("name")
        address = validated_data.pop("address")
        latitude = validated_data.pop("latitude")
        longitude = validated_data.pop("longitude")
        place, _ = Place.objects.get_or_create(
            external_id=external_id,
            defaults={
                "name": name,
                "address": address,
                "latitude": latitude,
                "longitude": longitude,
            }
        )

        validated_data["place"] = place
        return super().create(validated_data)
        
class RemoveSavedPlaceFromTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripSavedPlace
        fields = ["id"]
        read_only_fields = ["id"]

# /trips/{id}/saved-places (favorite places)
# /trips/{id}/trip-days (for overview)
# /trips/{id}/trip-days/{day_id} (for day details)
# /trips/{id}/trip-days/{day_id}/events (for events of the specific day)
# /trips/{id}/trip-days/{day_id}/events/{event_id} (for event details)