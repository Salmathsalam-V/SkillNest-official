import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillnest.settings')
app = Celery('skillnest')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
# celery.py

import platform

if platform.system() == 'Windows':
    worker_pool = 'solo'
else:
    worker_pool = 'prefork'
