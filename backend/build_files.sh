#!/bin/bash

# Move into the backend directory
cd "$(dirname "$0")"
echo "BUILD START in $(pwd)"

# Install dependencies
python3.12 -m pip install -r requirements.txt --break-system-packages

# Run migrations (IMPORTANT: needs DATABASE_URL to be set)
python3.12 manage.py migrate --noinput

# Run collectstatic
python3.12 manage.py collectstatic --noinput --clear

echo "BUILD END"
