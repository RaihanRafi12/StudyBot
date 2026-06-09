#!/usr/bin/env python
"""Run the API with Waitress (no Django runserver DB migration check)."""
import os
import sys

# Ensure backend root is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studybot.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

if __name__ == '__main__':
    from waitress import serve

    host = os.environ.get('API_HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', '8000'))
    print(f'StudyBot API listening on http://{host}:{port}/api/docs')
    serve(application, host=host, port=port, threads=4)
