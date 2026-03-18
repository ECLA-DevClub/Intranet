from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
<<<<<<< HEAD
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-%m7wei0-!ke_m8te^tjd8+_s1jz62p6tx56*7egt$yz)3_aqz0"

# SECURITY WARNING: define the correct hosts in production!
ALLOWED_HOSTS = ["*"]
=======
# DEBUG is now handled in base.py via env
>>>>>>> b8aa2b1 (Setup Docker environment)

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


try:
    from .local import *
except ImportError:
    pass
