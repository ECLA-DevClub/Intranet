# Use an official Python runtime based on Debian 12 "bookworm" as a parent image.
FROM python:3.12-slim-bookworm

# Add user that will be used in the container.
RUN useradd wagtail

# Port used by this container to serve HTTP.
EXPOSE 8000

# Set environment variables.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install system packages required by Wagtail and Django.
RUN apt-get update --yes --quiet && apt-get install --yes --quiet --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    libwebp-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Use /app folder as a directory where the source code is stored.
WORKDIR /app

# Install the project requirements.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the source code of the project into the container.
COPY . .

# Set permissions.
RUN chown -R wagtail:wagtail /app

# Use user "wagtail" to run the build commands below and the server itself.
USER wagtail

# Collect static files.
RUN python manage.py collectstatic --noinput --clear

# Start the application server via entrypoint
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]
