web: gunicorn app.run:app -e FLASK_ENV='production' --enable-stdio-inheritance
release: flask db upgrade
