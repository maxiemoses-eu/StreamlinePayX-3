# Use an official Python image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# FIX: Update Debian security patches
# This is the equivalent of 'apk upgrade' but for Debian-based images.
# It fixes vulnerabilities in system libraries like glibc and openssl.
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# SECURITY BEST PRACTICE: Run as a non-root user
# This prevents many exploits from gaining full control of the container.
RUN useradd -m streamlineuser
USER streamlineuser

# Expose the port the app runs on (Port 3002 for StreamlinePay Users)
EXPOSE 3002

# Define the command to run the application
CMD [ "python", "app.py" ]