# Use a valid slim JDK base image
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app
COPY CartService.java .
RUN javac CartService.java

CMD ["jshell"]
