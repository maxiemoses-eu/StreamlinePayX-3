# Use an official OpenJDK image
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the source file
COPY CartService.java .

# Compile the Java file
RUN javac CartService.java

# Expose the port the app runs on (Port 3003)
EXPOSE 3003

# Define the command to run the compiled class
# Note: The .class file is created by the RUN javac command
CMD ["java", "CartService"]