from rest_framework.routers import DefaultRouter
from dj_rest_auth.views import PasswordResetConfirmView
from django.urls import path, include

router = DefaultRouter()

urlpatterns = [
    path("", include("dj_rest_auth.urls")),
    path("registration/", include("dj_rest_auth.registration.urls"), name="dj_rest_auth_registration"),
    path("password/reset/confirm/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]