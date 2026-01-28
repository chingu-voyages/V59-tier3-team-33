from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from .services import send_welcome_mail
from allauth.account.signals import user_signed_up

User = get_user_model()

@receiver(user_signed_up)
def send_welcome_email(sender, request, user, **kwargs):
    # send a welcome email to the user when the user is created
    send_welcome_mail(user)