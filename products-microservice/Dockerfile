# STAGE 1: Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# STAGE 2: Runtime
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app

# Copy only what is needed
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3001

# Distroless expects the JS file directly
CMD ["server.js"]
