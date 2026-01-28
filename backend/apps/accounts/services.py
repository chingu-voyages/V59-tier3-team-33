from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

User = get_user_model()

def send_welcome_mail(user: User):
    name_to_use = user.first_name if user.first_name else "Traveller"
    subject = "Welcome to JoyRoute"
    message = (
        f"Hi {name_to_use},\n\n"
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
    