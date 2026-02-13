from rest_framework import serializers
from .models import Place


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = [
            "id",
            "external_id",
            "name",
            "address",
            "latitude",
            "longitude",
        ]
        read_only_fields = ["id"]


class CreatePlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ["external_id", "name", "address", "latitude", "longitude"]
        extra_kwargs = {
            "external_id": {
                "validators": []  # Disable the default UniqueValidator
            }
        }

    def create(self, validated_data):
        # Get or create place based on external_id
        place, _ = Place.objects.get_or_create(
            external_id=validated_data["external_id"],
            defaults={
                "name": validated_data["name"],
                "address": validated_data["address"],
                "latitude": validated_data["latitude"],
                "longitude": validated_data["longitude"],
            },
        )
        return place
