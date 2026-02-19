import time
import logging
import traceback
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string

User = get_user_model()
logger = logging.getLogger(__name__)


def send_welcome_mail(user: User, max_retries=3):
    time.sleep(5)

    name_to_use = user.first_name if user.first_name else "Traveller"
    subject = "Welcome to JoyRoute"
    
    html_message = render_to_string(
        "email/welcome_email.html",
        {
            "user": user,
            "frontend_url": settings.FRONTEND_URL,
        }
    )
    
    text_message = render_to_string(
        "email/welcome_email.txt",
        {
            "user": user,
            "frontend_url": settings.FRONTEND_URL,
        }
    )

    for attempt in range(max_retries):
        try:
            logger.info(
                f"Attempt {attempt + 1}/{max_retries}: Sending welcome email to {user.email}"
            )

            sleep_time = 10 * (2**attempt)
            if attempt > 0:
                logger.info(
                    f"Rate limited. Waiting {sleep_time} seconds before retry..."
                )
                time.sleep(sleep_time)

            result = send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )

            logger.info(
                f"Welcome email sent successfully to {user.email}. Result: {result}"
            )
            return result
        except Exception as e:
            logger.warning(
                f"Attempt {attempt + 1} failed for {user.email}: {type(e).__name__}: {e}"
            )

            if attempt == max_retries - 1:
                logger.error(
                    f"Failed to send welcome email to {user.email} after {max_retries} attempts"
                )
                logger.error(f"Final error: {type(e).__name__}: {e}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise
            else:
                continue
