# STAGE 1: Build (The "Kitchen")
# We use Alpine here to have access to npm and the shell
FROM node:20-alpine AS build
WORKDIR /app

# Upgrade Alpine here just to keep the build environment safe
RUN apk update && apk upgrade --no-cache

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# If you have a build step (like TypeScript), run it here:
# RUN npm run build

# STAGE 2: Runtime (The "Dining Room")
# This image has NO shell and NO OS vulnerabilities. 
# It only contains the Node.js runtime.
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app

# Copy ONLY the files needed to run the app from the build stage
COPY --from=build /app /app

# StreamlinePay products service runs on 3001
EXPOSE 3001

# IMPORTANT: In distroless, you don't use "npm start" because 
# there is no 'npm' or 'sh' inside the image. You must call node directly.
CMD ["index.js"]