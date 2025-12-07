# Use an official Python image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port the app runs on (Port 3002)
EXPOSE 3002

# Define the command to run the application
# Use 0.0.0.0 to ensure the app is accessible outside the container
CMD [ "python", "app.py" ]