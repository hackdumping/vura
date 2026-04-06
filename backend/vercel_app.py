import os
import sys

# Add the current directory (backend/) to the path so apps like 'users', 'forms' are found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vura_core.wsgi import application

app = application
