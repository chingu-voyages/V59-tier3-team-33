from dj_rest_auth.views import PasswordResetConfirmView
from drf_spectacular.utils import extend_schema

@extend_schema(exclude=True)
class PasswordResetConfirmView(PasswordResetConfirmView):
    pass