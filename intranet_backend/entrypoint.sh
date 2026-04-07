#!/bin/sh

# Накатываем миграции
echo "Running migrations..."
python manage.py migrate --noinput

# Создаем суперюзера
echo "Setting up admin user..."
python setup_admin.py

# Запускаем сервер
echo "Starting gunicorn..."
exec gunicorn intranet_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000}
