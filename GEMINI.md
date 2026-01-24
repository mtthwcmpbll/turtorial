# Turtorial Project Context

## Overview
**Turtorial** is an interactive, terminal-based educational platform designed to guide users through software tutorials. It combines a robust Java backend for terminal emulation and lesson management with a modern React frontend for a rich user interface.

## Tech Stack
The project utilizes a bleeding-edge technology stack (context: Jan 2026):

### Backend
*   **Language:** Java 25
*   **Framework:** Spring Boot 4.0.1
*   **Architecture:** Spring Modulith
*   **Terminal Emulation:** `pty4j` (server-side pseudo-terminal)
*   **Communication:** WebSockets (for real-time terminal streaming)
*   **Build Tool:** Maven (Wrapper included)

### Frontend (`src/main/frontend`)
*   **Framework:** React 19
*   **Language:** TypeScript
*   **Build Tool:** Vite 7
*   **Styling:** Tailwind CSS 4, Radix UI
*   **Terminal UI:** Xterm.js (`@xterm/xterm`)
*   **Content:** React Markdown / MDX

## Architecture

### Hybrid Monolith
The application is designed to be deployed as a single unit.
*   **Development:** The backend runs on port `8080` (Spring Boot), and the frontend runs on a separate Vite dev server (usually port `5173`).
*   **Production:** The `frontend-maven-plugin` builds the React app and copies the artifacts into `target/classes/static`. The resulting Spring Boot JAR serves the frontend index.html as a static resource.

### Key Components
*   **Terminal Integration:**
    *   **Backend:** `TerminalSocketHandler.java` manages WebSocket connections and interfaces with `pty4j` to spawn shell processes.
    *   **Frontend:** `TerminalComponent.tsx` renders the Xterm.js interface and sends keystrokes/receives output via WebSockets.
*   **Lesson Engine:**
    *   **Content:** Lessons are stored in `src/main/resources/lessons` as MDX/Markdown files.
    *   **Service:** `LessonService.java` parses and serves these lessons.

## Development Workflow

### Prerequisites
*   **Java:** JDK 25
*   **Node.js:** v24.12.0 (managed automatically by Maven in production profile)

### Running Locally (Development Mode)
Run backend and frontend separately for hot-reloading.

**1. Backend:**
```bash
./mvnw spring-boot:run
```
*Server starts on `http://localhost:8080`*

**2. Frontend:**
```bash
cd src/main/frontend
npm install
npm run dev
```
*Access UI at the Vite URL provided (usually `http://localhost:5173`)*

### Building for Production
To build a self-contained JAR that includes the compiled frontend:

```bash
./mvnw clean package -Pproduction
```
*   This triggers the `production` profile in `pom.xml`.
*   It installs Node/NPM, builds the frontend via Vite, and copies dist files to the JAR.
*   **Run:** `java -jar target/turtorial-0.0.1-SNAPSHOT.jar`

### Docker
```bash
docker compose up --build
```
*Serves the application on port `8080`.*

## Directory Structure
*   `src/main/java`: Spring Boot backend source code.
*   `src/main/frontend`: React frontend source code.
*   `src/main/resources/lessons`: Tutorial content (Markdown).
*   `src/main/resources/application.properties`: Backend configuration.
