# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# FIX: Update Alpine OS and fix Node ecosystem vulnerabilities
RUN apk update && apk upgrade --no-cache

# Copy only package files first
COPY package*.json ./

# OPTIMIZATION: Use --legacy-peer-deps for Jest/React conflict
# Added --prefer-offline to speed up Jenkins builds
RUN npm install --legacy-peer-deps --prefer-offline

# FIX: Force update vulnerable 'glob' if it's in your dependency tree
# This addresses the widespread CVE-2025-64756
RUN npm install glob@latest --save-dev

COPY . .
RUN npm run build

# Stage 2: Production Environment
FROM nginx:stable-alpine

# FIX: Security upgrade for the Nginx runtime environment
# This clears the "HIGH" vulnerabilities often found in the base Nginx image
RUN apk update && apk upgrade --no-cache

# Copy the built files from Stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Security Best Practice: Remove default nginx config if you have a custom one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]