"""ASGI config for FeastFleet project."""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'feastfleet.settings')
application = get_asgi_application()
