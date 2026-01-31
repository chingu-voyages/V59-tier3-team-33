from rest_framework import serializers
from .models import Trip, UserTrip, TripDay

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ["id", "name", "start_date", "end_date", "created_at"]
        read_only_fields = ["id", "created_at"]
        
    def validate(self, attrs):
        if attrs["start_date"] > attrs["end_date"]:
            raise serializers.ValidationError("End date must be after start date.")
        return attrs