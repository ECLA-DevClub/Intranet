FROM nginx:stable-alpine

COPY default.conf /etc/nginx/conf.d/default.conf

# Create directories for static/media if they don't exist
RUN mkdir -p /app/static /app/media
