import os
import sys

# Get the root directory
# __file__ is /api/index.py
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add backend directory to sys.path so apps like 'users', 'forms' can be imported
backend_dir = os.path.join(root_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# Import Django's WSGI application
from vura_core.wsgi import application

# 'app' is the standard Vercel variable name for the WSGI/ASGI entry point
app = application
