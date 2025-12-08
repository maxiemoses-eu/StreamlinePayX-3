# Use a stable JDK base (non-alpine to avoid flaky registry lookups)
FROM eclipse-temurin:17-jdk

WORKDIR /app
COPY CartService.java .
RUN javac CartService.java

CMD ["jshell"]
