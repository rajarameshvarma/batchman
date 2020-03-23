#!/bin/bash
flask db upgrade && gunicorn app.run:app -e FLASK_ENV='development' --enable-stdio-inheritance -b 0.0.0.0:8000