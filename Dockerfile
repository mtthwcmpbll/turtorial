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

# Create app directory
WORKDIR /app

# Copy the built application
# Assumes `mvn clean package` has been run locally
COPY target/turtorial-*-SNAPSHOT.jar /app/turtorial.jar

# Create the turtorial user
RUN useradd -m -s /bin/bash turtorial

RUN mkdir -p /home/turtorial/.ssh \
    && chown -R turtorial:turtorial /home/turtorial/.ssh

# Change ownership of the app directory
RUN chown -R turtorial:turtorial /app

# Switch to the new user
USER turtorial

# Set the working directory to the user's home
WORKDIR /home/turtorial

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "/app/turtorial.jar"]

FROM base AS training_environment

# This Dockerfile is intended to be customized by the end user to set up the lesson environment.
# You can add additional languages, tools, etc. here.

################################################################################
# MODERNE CLI SETUP
################################################################################


FROM base AS modcli
USER root
ARG MODERNE_CLI_STAGE=stable
ARG MODERNE_CLI_VERSION
# Set the environment variable MODERNE_CLI_VERSION
ENV MODERNE_CLI_VERSION=${MODERNE_CLI_VERSION}

WORKDIR /app

# Download the specified version of moderne-cli JAR file if MODERNE_CLI_VERSION is provided,
# otherwise download the latest version
RUN if [ -n "${MODERNE_CLI_VERSION}" ]; then \
    echo "Downloading version: ${MODERNE_CLI_VERSION}"; \
    curl -s --insecure --request GET --url "https://repo1.maven.org/maven2/io/moderne/moderne-cli/${MODERNE_CLI_VERSION}/moderne-cli-${MODERNE_CLI_VERSION}.jar" --output /usr/local/bin/mod.jar; \
    elif [ "${MODERNE_CLI_STAGE}" == "staging" ]; then \
    LATEST_VERSION=$(curl -s --insecure --request GET --url "https://api.github.com/repos/moderneinc/moderne-cli-releases/releases" | jq '.[0].tag_name' -r | sed "s/^v//"); \
    if [ -z "${LATEST_VERSION}" ]; then \
    echo "Failed to get latest staging version"; \
    exit 1; \
    fi; \
    echo "Downloading latest staging version: ${LATEST_VERSION}"; \
    curl -s --insecure --request GET --url "https://repo1.maven.org/maven2/io/moderne/moderne-cli/${LATEST_VERSION}/moderne-cli-${LATEST_VERSION}.jar" --output /usr/local/bin/mod.jar; \
    else \
    LATEST_VERSION=$(curl -s --insecure --request GET --url "https://api.github.com/repos/moderneinc/moderne-cli-releases/releases/latest" | jq '.tag_name' -r | sed "s/^v//"); \
    if [ -z "${LATEST_VERSION}" ]; then \
    echo "Failed to get latest stable version"; \
    exit 1; \
    fi; \
    echo "Downloading latest stable version: ${LATEST_VERSION}"; \
    curl -s --insecure --request GET --url "https://repo1.maven.org/maven2/io/moderne/moderne-cli/${LATEST_VERSION}/moderne-cli-${LATEST_VERSION}.jar" --output /usr/local/bin/mod.jar; \
    fi

# Create a shell script 'mod' that runs the moderne-cli JAR file
RUN echo -e '#!/bin/sh\njava -jar /usr/local/bin/mod.jar "$@"' > /usr/local/bin/mod

# Make the 'mod' script executable
RUN chmod +x /usr/local/bin/mod

# Make sure that the image is still running as the turtorial user in the standard starting directory
USER turtorial

RUN ssh-keyscan github.com >> ~/.ssh/known_hosts

# Clone our tutorial repository
RUN git clone https://github.com/modernetraining/moderne-migration-practice.git /home/turtorial/moderne-migration-practice
ENV WORKSHOP=/home/turtorial/moderne-migration-practice

# Replace SSH URLs with HTTPS URLs in repos.csv
RUN sed -i 's/git@github.com:/https:\/\/github.com\//g' ${WORKSHOP}/repos.csv
RUN sed -i 's/git@github.com:/https:\/\/github.com\//g' ${WORKSHOP}/repos-waves.csv


# Clone our practice repository
RUN mkdir -p /home/turtorial/workspaces/step1 \
    && cd /home/turtorial/workspaces/step1 \
    && mod git sync csv . ${WORKSHOP}/repos.csv --with-sources

WORKDIR /home/turtorial