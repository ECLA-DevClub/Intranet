from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG is now handled in base.py via env

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


try:
    from .local import *
except ImportError:
    pass
