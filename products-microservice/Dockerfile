# Use stable Node image (no distroless)
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY server.js .

# Expose app port
EXPOSE 3001

# Start the app
CMD ["node", "server.js"]
