from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomRegisterSerializer(RegisterSerializer):
    username = None
    first_name = serializers.CharField(required=True, max_length=30)
    last_name = serializers.CharField(required=True, max_length=30)

    def save(self, request):
        user = super().save(request)
        user.email = self.validated_data.get("email", "").lower().strip()  # type: ignore
        user.first_name = self.validated_data.get("first_name", "").lower().strip()  # type: ignore
        user.last_name = self.validated_data.get("last_name", "").lower().strip()  # type: ignore
        user.save()
        return user
