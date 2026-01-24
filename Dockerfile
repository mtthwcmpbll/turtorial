FROM ubuntu:24.04 AS base

# Set install locations
ENV JAVA_HOME=/opt/java/openjdk
ENV MAVEN_HOME=/opt/maven
ENV GRADLE_HOME=/opt/gradle

# Update PATH
ENV PATH=$JAVA_HOME/bin:$MAVEN_HOME/bin:$GRADLE_HOME/bin:$PATH

# Install base dependencies
# - git, bash, jq, curl, wget, zip, unzip, vim, nano: Common tools for the terminal environment
RUN apt-get update && apt-get install -y \
    git \
    bash \
    jq \
    curl \
    wget \
    zip \
    unzip \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Install Temurin JDK 25
RUN mkdir -p $JAVA_HOME \
    && curl -L "https://github.com/adoptium/temurin25-binaries/releases/download/jdk-25.0.1%2B8/OpenJDK25U-jdk_aarch64_linux_hotspot_25.0.1_8.tar.gz" | tar -xz -C $JAVA_HOME --strip-components=1

# Install Maven
RUN mkdir -p $MAVEN_HOME \
    && curl -L "https://dlcdn.apache.org/maven/maven-3/3.9.12/binaries/apache-maven-3.9.12-bin.tar.gz" | tar -xz -C $MAVEN_HOME --strip-components=1

# Install Gradle
RUN mkdir -p $GRADLE_HOME \
    && curl -L -o /tmp/gradle.zip "https://services.gradle.org/distributions/gradle-9.2.1-bin.zip" \
    && unzip /tmp/gradle.zip -d /opt \
    && mv /opt/gradle-9.2.1/* $GRADLE_HOME/ \
    && rm -rf /opt/gradle-9.2.1 /tmp/gradle.zip

FROM base AS platform

# Create the turtorial user
RUN useradd -m -s /bin/bash turtorial

RUN mkdir -p /home/turtorial/.ssh \
    && chown -R turtorial:turtorial /home/turtorial/.ssh

# Create app directory
WORKDIR /app

# Copy the built application
# Assumes `mvn clean package` has been run locally
ARG JAR_FILE=target/turtorial-*-SNAPSHOT.jar
COPY ${JAR_FILE} /app/turtorial.jar

# Change ownership of the app directory
RUN chown -R turtorial:turtorial /app

# Switch to the new user
USER turtorial

# Set the working directory to the user's home
WORKDIR /home/turtorial

# Expose the application port
EXPOSE 8080

# Create the lessons directory
RUN mkdir -p /app/lessons

# Run the application
ENTRYPOINT ["java", "-jar", "/app/turtorial.jar"]