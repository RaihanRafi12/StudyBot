#!/usr/bin/env python
"""Run the API with Waitress (no Django runserver DB migration check)."""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studybot.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

if __name__ == '__main__':
    from waitress import serve

    host = os.environ.get('API_HOST', '127.0.0.1')
    port = int(os.environ.get('API_PORT', '8000'))
    print(f'StudyBot API listening on http://{host}:{port}/api/docs')
    serve(application, host=host, port=port, threads=4)
