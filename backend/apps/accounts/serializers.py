from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import LoginSerializer, PasswordResetSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.conf import settings
from allauth.account.utils import user_pk_to_url_str

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


class CustomLoginSerializer(LoginSerializer):
    username = None


# Custom URL generator for password reset emails
def custom_url_generator(request, user, temp_key):
    return f"{settings.FRONTEND_URL}/{settings.FRONTEND_PASSWORD_RESET_PATH_NAME}/{user_pk_to_url_str(user)}/{temp_key}/"


class CustomPasswordResetSerializer(PasswordResetSerializer):
    def get_email_options(self):
        return {"url_generator": custom_url_generator}


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name"]
        read_only_fields = ["id", "email", "first_name", "last_name"]
