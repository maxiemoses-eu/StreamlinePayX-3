# Use a slimmer OpenJDK base to avoid huge pulls
FROM eclipse-temurin:17-jdk-slim

WORKDIR /app
COPY CartService.java .
RUN javac CartService.java

CMD ["jshell"]
