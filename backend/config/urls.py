from django.contrib import admin
from django.urls import path, include
from dj_rest_auth.views import PasswordResetConfirmView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("dj_rest_auth.urls")),
    path(
        "api/registration/",
        include("dj_rest_auth.registration.urls"),
        name="dj_rest_auth_registration",
    ),
    path(
        "api/password/reset/confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
]
