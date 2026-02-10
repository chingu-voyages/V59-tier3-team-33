from rest_framework.routers import DefaultRouter
from apps.core.views import PasswordResetConfirmView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from django.urls import path, include

router = DefaultRouter()

urlpatterns = [
    path("", include("dj_rest_auth.urls")),
    path(
        "registration/",
        include("dj_rest_auth.registration.urls"),
        name="dj_rest_auth_registration",
    ),
    path(
        "password/reset/confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path("", include("apps.itineraries.urls")),
    # api docs
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    # Optional UI:
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
