from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom adapter to override email confirmation URLs to point to frontend.
    """

    def get_email_confirmation_url(self, request, emailconfirmation):
        """
        Returns the frontend URL for email confirmation.
        The frontend should handle this URL and call the backend API endpoint.

        Backend endpoint: POST /api/registration/verify-email/
        Request body: {"key": "<email_confirmation_key>"}
        """

        frontend_url = settings.FRONTEND_URL.rstrip("/")
        frontend_email_verification_path_name = (
            settings.FRONTEND_EMAIL_VERIFICATION_PATH_NAME.rstrip("/")
        )
        return f"{frontend_url}/{frontend_email_verification_path_name}/{emailconfirmation.key}/"
