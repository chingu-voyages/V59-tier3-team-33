from rest_framework import serializers
from apps.places.models import Place

class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ["name", "description", "address", "latitude", "longitude"]
        