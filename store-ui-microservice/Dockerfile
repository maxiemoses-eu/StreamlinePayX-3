# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package*.json ./

# OPTIMIZATION: Use --legacy-peer-deps for the Jest conflict 
# and --network=host if you have DNS issues during build
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Production Environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]