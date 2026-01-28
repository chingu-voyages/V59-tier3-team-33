from django.conf import settings
from django.contrib.auth.forms import User
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

User = get_user_model()

def send_welcome_mail(user: User):
    subject = "Welcome to JoyRoute"
    message = (
        f"Hi {user.first_name},\n\n"
        "Thank you for joining JoyRoute! We're excited to have you on board.\n\n"
        "Best regards,\n"
        "JoyRoute Team"
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
    