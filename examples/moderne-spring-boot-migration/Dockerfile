FROM turtorial:latest AS base

# This Dockerfile is intended to be customized by the end user to set up the lesson environment.
# You can add additional languages, tools, etc. here.

# Note:
# - You should always switch back to the turtorial user at the end, so that the web-based terminal runs as that user.
# - The turtorial platform is located in /app, but you shouldn't need that when building your workshop here

################################################################################
# MODERNE CLI SETUP
################################################################################

USER root

# Install Temurin JDK 17 (needed for Spring Boot 2.7 migration workshop)
# Note: turtorial:latest installs Java 25 to /opt/java/openjdk
RUN mkdir -p /opt/java/openjdk17 \
    && curl -L "https://api.adoptium.net/v3/binary/latest/17/ga/linux/aarch64/jdk/hotspot/normal/eclipse" | tar -xz -C /opt/java/openjdk17 --strip-components=1

# Set JAVA_HOME to Java 17 for the workshop exercises
ENV JAVA_HOME=/opt/java/openjdk17
ENV PATH=$JAVA_HOME/bin:$PATH

ARG MODERNE_CLI_STAGE=stable
ARG MODERNE_CLI_VERSION
# Set the environment variable MODERNE_CLI_VERSION
ENV MODERNE_CLI_VERSION=${MODERNE_CLI_VERSION}

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

# Copy over our lessons
COPY --chown=turtorial:turtorial lessons /app/lessons

WORKDIR /home/turtorial

# Run the application (using Java 25 from the base image location)
ENTRYPOINT ["/opt/java/openjdk/bin/java", "-jar", "/app/turtorial.jar"]