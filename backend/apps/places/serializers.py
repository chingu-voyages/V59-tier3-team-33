from rest_framework import serializers

class PlaceSearchSerializer(serializers.Serializer):
    external_id = serializers.CharField(max_length=255)
    address = serializers.CharField(max_length = 255)
    name = serializers.CharField(max_length=255)
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()