FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
RUN apk update && apk upgrade --no-cache
COPY CartService.java .
RUN javac CartService.java

# FIX: Run the Java class directly, NOT jshell
CMD ["java", "CartService"]