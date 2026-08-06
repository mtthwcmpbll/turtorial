# Build arg to select JAR source: "build" (compile from source) or "prebuilt" (use pre-built JAR)
ARG JAR_SOURCE=build

# Builder stage — compiles JAR from source with frontend (default)
FROM eclipse-temurin:25-jdk AS build
WORKDIR /build
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw clean package -Pprod -DskipTests \
    && cp target/turtorial-*.jar /turtorial.jar

# Prebuilt stage — copies JAR from build context (CI or local pre-built)
FROM scratch AS prebuilt
COPY target/turtorial-*.jar /turtorial.jar

# Select JAR source based on ARG (BuildKit skips unused stages)
FROM ${JAR_SOURCE} AS jar

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

# Install Temurin JDK 25 (detect architecture automatically)
RUN ARCH=$(uname -m) \
    && case "$ARCH" in \
       x86_64) TEMURIN_ARCH="x64" ;; \
       aarch64) TEMURIN_ARCH="aarch64" ;; \
       *) echo "Unsupported architecture: $ARCH" && exit 1 ;; \
    esac \
    && mkdir -p $JAVA_HOME \
    && curl -L "https://api.adoptium.net/v3/binary/latest/25/ga/linux/${TEMURIN_ARCH}/jdk/hotspot/normal/eclipse?project=jdk" | tar -xz -C $JAVA_HOME --strip-components=1

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

# Copy the JAR from the selected source
COPY --from=jar /turtorial.jar /app/turtorial.jar

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
