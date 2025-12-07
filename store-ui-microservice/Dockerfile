# Use a very lightweight Nginx image
FROM nginx:alpine

# Remove default Nginx index page (optional but clean)
RUN rm -rf /usr/share/nginx/html/*

# Copy your static site content into the Nginx public directory
COPY index.html /usr/share/nginx/html/

# Expose the default Nginx web port
EXPOSE 80

# The base image's default CMD is used to start Nginx