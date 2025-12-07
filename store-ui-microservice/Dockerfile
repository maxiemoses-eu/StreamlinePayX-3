# Use a very lightweight Nginx image
FROM nginx:alpine

# Copy the HTML file into the Nginx default public directory
# The Nginx image is already configured to serve content from this path
COPY index.html /usr/share/nginx/html/

# Expose the default Nginx web port (Port 80)
EXPOSE 80

# The default Nginx CMD is sufficient to start the web server
# CMD ["nginx", "-g", "daemon off;"]