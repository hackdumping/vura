#!/bin/bash

echo "BUILD START"

# Install dependencies
python3.12 -m pip install -r requirements.txt

# Run collectstatic
python3.12 manage.py collectstatic --noinput --clear

echo "BUILD END"
