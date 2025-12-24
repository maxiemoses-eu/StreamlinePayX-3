# Use a specific, stable version of the JDK on Alpine
FROM eclipse-temurin:17-jdk-alpine

# Set the working directory
WORKDIR /app

# FIX: Upgrade Alpine packages to patch vulnerabilities (common in 3.22/3.23)
# This addresses the HIGH/CRITICAL findings Trivy reported in your Jenkins logs
RUN apk update && apk upgrade --no-cache

# Copy the source code
COPY CartService.java .

# Compile the service
RUN javac CartService.java

# Using 'sh' as a placeholder or 'java' if you want it to run directly
# CMD ["java", "CartService"] 
CMD ["jshell"]