from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / ".env")


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-6v*(n0ti-5vebh1au9pnhnx54ie!ok$k556%r508y+&d_^d$a&"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "rest_framework",
    "rest_framework.authtoken",
    "drf_spectacular",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "corsheaders",
    "django_extensions",
    "apps.accounts",
    "apps.itineraries",
    "apps.places",
]

SITE_ID = 1


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        # Accept cookie-based auth tokens
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # Accept authorization header tokens
        "dj_rest_auth.jwt_auth.JWTCookieAuthentication",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "apps.core.renderer.StandardResponseRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
    "DEFAULT_THROTTLE_CLASSES": [
        'rest_framework.throttling.AnonRateThrottle', # Limits guests
        'rest_framework.throttling.UserRateThrottle' # Limits authenticated requests
    ],
    "DEFAULT_THROTTLE_RATES": {
        'anon': '10/minute',
        'user': '100/minute'
    },
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "JoyRoute API",
    "DESCRIPTION": "API documentation for JoyRoute",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = "/static/"

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "accounts.User"

# Console email backend for development
# EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# SMTP email backend
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = 'sandbox.smtp.mailtrap.io'
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
EMAIL_PORT = os.environ.get("EMAIL_PORT")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL")

REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_COOKIE": "my-app-auth",
    "JWT_AUTH_REFRESH_COOKIE": "my-refresh-token",
    "REGISTER_SERIALIZER": "apps.accounts.serializers.CustomRegisterSerializer",
    "LOGIN_SERIALIZER": "apps.accounts.serializers.CustomLoginSerializer",
    "PASSWORD_RESET_SERIALIZER": "apps.accounts.serializers.CustomPasswordResetSerializer"
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.environ.get("ACCESS_TOKEN_LIFETIME", 5))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.environ.get("REFRESH_TOKEN_LIFETIME", 1))
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
}

AUTHENTICATION_BACKENDS = [
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",
    # `allauth` specific authentication methods, such as login by email
    "allauth.account.auth_backends.AuthenticationBackend",
]

ACCOUNT_LOGIN_METHODS = ["email"]
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_EMAIL_VERIFICATION = "mandatory"


# Use custom adapter for email confirmation URLs
ACCOUNT_ADAPTER = "apps.accounts.adapters.CustomAccountAdapter"

# CORS CONFIG
CORS_ALLOWED_ORIGINS = []
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d{4}$",
]

# FRONTEND CONFIG
FRONTEND_EMAIL_VERIFICATION_PATH_NAME = os.environ.get(
    "FRONTEND_EMAIL_VERIFICATION_PATH_NAME", "verify-email"
)
FRONTEND_PASSWORD_RESET_PATH_NAME = os.environ.get(
    "FRONTEND_PASSWORD_RESET_PATH_NAME", "reset-password"
)
