# Building Turtorial 🏗️

Welcome to the technical guide for **Turtorial**. This document is intended for developers, platform engineers, and contributors who need to build, run, and modify the underlying Turtorial application.

If you are looking to create content (lessons, quizzes, etc.) without modifying the platform code, please see the main [README.md](README.md).

## 🛠️ Prerequisites

To build and run Turtorial locally, you will need:

*   **Java**: JDK 25 or later.
*   **Node.js**: v24.12.0 or later (automatically managed by Maven in production builds).
*   **Docker** (Optional): For containerized deployment.

## 🚀 Running Locally (Development Mode)

For the best development experience, we recommend running the backend and frontend separately. This enables hot-reloading for rapid iteration.

### 1. Backend

Start the Spring Boot application:

```bash
./mvnw spring-boot:run
```
*The server will start on `http://localhost:8080`.*

### 2. Frontend

In a new terminal window, navigate to the frontend directory and start the Vite development server:

```bash
cd src/main/frontend
npm install
npm run dev
```
*Access the UI at the URL provided in the terminal (usually `http://localhost:5173`).*

## 📦 Building for Production

To create a self-contained JAR file that includes the compiled frontend assets:

```bash
./mvnw clean package -Pproduction
```
*   This command activates the `production` profile in `pom.xml`.
*   It automatically installs Node/NPM, builds the frontend application via Vite, and copies the distribution artifacts into the JAR.
*   **Run the artifact:** `java -jar target/turtorial-0.0.1-SNAPSHOT.jar`

## 🐳 Docker

You can also run the application using Docker Compose, which handles the build and execution for you:

```bash
docker compose up --build
```
*The application will be available at `http://localhost:8080`.*

## 🏗️ Architecture

Turtorial utilizes a **Hybrid Monolith** architecture designed for simplicity and ease of deployment.

### Backend (Java 25 + Spring Boot 4)
*   **Core**: A standard Spring Boot 4.0.1 application managed by Maven.
*   **Terminal Emulation**: Uses `pty4j` for server-side pseudo-terminal management.
*   **Communication**: WebSockets provide real-time, bidirectional communication between the browser and the terminal process.
*   **Lesson Engine**: Parses MDX/Markdown content, manages lesson state, and handles file system interactions.

### Frontend (React 19 + TypeScript)
*   **Framework**: React 19 with Vite 7 for blazing-fast builds.
*   **UI Library**: Tailwind CSS 4 and Radix UI for accessible, modern components.
*   **Terminal UI**: `xterm.js` (`@xterm/xterm`) for rendering the terminal interface in the browser.
*   **Content Rendering**: Dynamically renders Markdown/MDX content.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. Before contributing, ensure your local environment is set up according to the instructions above.
