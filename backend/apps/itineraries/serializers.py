from rest_framework import serializers
from .models import Trip, UserTrip, TripDay, TripSavedPlace
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


# /trips/{id}/saved-places (favorite places)
# /trips/{id}/trip-days (for overview)
# /trips/{id}/trip-days/{day_id} (for day details)
# /trips/{id}/trip-days/{day_id}/events (for events of the specific day)
# /trips/{id}/trip-days/{day_id}/events/{event_id} (for event details)
