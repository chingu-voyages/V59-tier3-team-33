from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.template.loader import render_to_string


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

    def send_mail(self, template_prefix, email, context):
        """
        Override to send HTML emails for email confirmation and password reset.
        """
        from django.core.mail import send_mail
        
        # Handle both email confirmation and password reset
        if template_prefix == 'account/email/email_confirmation':
            template_name = 'account/email/email_confirmation_signup'
        else:
            template_name = template_prefix
        
        # Render HTML and text versions
        html_content = render_to_string(f'{template_name}_message.html', context)
        text_content = render_to_string(f'{template_name}_message.txt', context)
        
        # Get subject from template
        subject = render_to_string(f'{template_name}_subject.txt', context).strip()
        
        # Send both HTML and text versions
        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_content,
            fail_silently=False,
        )
