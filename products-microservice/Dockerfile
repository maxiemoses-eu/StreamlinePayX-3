# Use an official Node.js image as the base
# Pinning to alpine3.20 or 3.21 is often safer than the "latest" alpine
FROM node:20-alpine3.21

# Set the working directory inside the container
WORKDIR /app

# FIX: Update the package index and upgrade packages to fix OS-level vulnerabilities
# This is the most important line for passing the Trivy scan!
RUN apk update && apk upgrade --no-cache

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install application dependencies 
# Added --legacy-peer-deps to match your Jenkins pipeline environment
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (StreamlinePay products use 3001)
EXPOSE 3001

# Define the command to run the application
CMD [ "npm", "start" ]