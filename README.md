# Turtorial 🐢

**Turtorial** is an interactive, terminal-based educational platform designed to guide users through hands-on software tutorials. It combines a robust Java backend for terminal emulation and lesson management with a modern React frontend for a rich, interactive user interface.

## 🚀 Features

*   **Interactive Terminal**: Real-time terminal emulation powered by `pty4j` and `xterm.js`, allowing users to execute commands directly within the lesson environment.
*   **Step-by-Step Lessons**: Structured lessons with clear instructions and code blocks.
*   **Live Feedback**: Immediate feedback on command execution and quiz answers.
*   **Rich Content**: Support for Markdown and MDX for formatting text, code, and images.
*   **Quizzes**: Built-in support for multiple-choice and free-text quizzes to reinforce learning.
*   **Lifecycle Scripts**: Automate environment setup and cleanup with `before` and `after` scripts for each step.
*   **Hybrid Architecture**: Seamless integration of a Spring Boot backend and a React frontend.

## 🛠️ Getting Started

### Prerequisites

*   **Java**: JDK 25 or later.
*   **Node.js**: v24.12.0 or later (automatically managed by Maven in production builds).
*   **Docker** (Optional): For containerized deployment.

### Installation

Clone the repository:

```bash
git clone https://github.com/mtthwcmpbll/turtorial.git
cd turtorial
```

### Running Locally (Development Mode)

For the best development experience, run the backend and frontend separately to enable hot-reloading.

**1. Backend:**

Start the Spring Boot application:

```bash
./mvnw spring-boot:run
```
*The server will start on `http://localhost:8080`.*

**2. Frontend:**

In a new terminal, navigate to the frontend directory and start the dev server:

```bash
cd src/main/frontend
npm install
npm run dev
```
*Access the UI at the URL provided (usually `http://localhost:5173`).*

### Building for Production

To build a self-contained JAR that includes the compiled frontend:

```bash
./mvnw clean package -Pproduction
```
*   This triggers the `production` profile in `pom.xml`.
*   It installs Node/NPM, builds the frontend via Vite, and copies the artifacts into the JAR.
*   **Run:** `java -jar target/turtorial-0.0.1-SNAPSHOT.jar`

### Docker

Run the application using Docker Compose:

```bash
docker compose up --build
```
*The application will be available at `http://localhost:8080`.*

## 📚 Writing Lessons

Turtorial makes it easy to create your own interactive lessons. Lessons are stored in `src/main/resources/lessons` as Markdown/MDX files.

### Directory Structure

Each lesson resides in its own directory under `src/main/resources/lessons`.

```
src/main/resources/lessons/
└── my-awesome-lesson/       # Your lesson directory
    ├── lesson.yml           # Lesson metadata
    ├── 01-intro.mdx         # Step 1
    ├── 02-setup.mdx         # Step 2
    └── ...
```

### Lesson Metadata (`lesson.yml`)

Create a `lesson.yml` (or `lesson.yaml`) file in your lesson directory to define the lesson's title and description.

```yaml
title: My Awesome Lesson
description: Learn how to build cool things with Turtorial!
```

### Step Configuration

Each step is a Markdown (`.md`) or MDX (`.mdx`) file. Use frontmatter to configure the step's properties.

```markdown
---
title: Introduction
order: 1
section: Basics
---

# Welcome!

This is the first step of your lesson.
```

*   **`title`**: The title of the step.
*   **`order`**: The sequence number of the step (e.g., 1, 2, 3).
*   **`section`**: (Optional) Group steps into sections in the navigation sidebar.

### Interactive Quizzes

You can embed quizzes directly into your lesson steps using the `quizzes` field in the frontmatter.

**Multiple Choice Quiz:**

```yaml
---
title: Quiz Time
quizzes:
  - question: Which language is Turtorial built with?
    type: CHOICE
    options:
      - Python
      - Java
      - Ruby
    correctAnswer: Java
---
```

**Free Text Quiz:**

```yaml
---
title: Text Input
quizzes:
  - question: Type "hello" to continue.
    type: TEXT
    validationRegex: "^hello$"
---
```

### Lifecycle Scripts

Automate environment setup and cleanup using `before` and `after` scripts in the frontmatter.

*   **`before`**: Runs when the step is loaded. Useful for creating files or starting services.
*   **`after`**: Runs when navigating away from the step. Useful for cleanup.

```markdown
---
title: File Operations
before: echo "Hello" > /tmp/hello.txt
after: rm /tmp/hello.txt
---

Check the file created by the script:

```bash
cat /tmp/hello.txt
```
```

## 🏗️ Architecture

Turtorial uses a **Hybrid Monolith** architecture:

### Backend (Java 25 + Spring Boot 4)
*   **Core**: Spring Boot 4.0.1 application managed by Maven.
*   **Terminal**: `pty4j` for server-side pseudo-terminal management.
*   **Communication**: WebSockets for real-time bidirectional communication between the browser and the terminal process.
*   **Lesson Engine**: Parses and serves MDX/Markdown content and manages lesson state.

### Frontend (React 19 + TypeScript)
*   **Framework**: React 19 with Vite 7 for fast builds.
*   **UI Library**: Tailwind CSS 4 and Radix UI for accessible components.
*   **Terminal UI**: `xterm.js` (`@xterm/xterm`) for rendering the terminal in the browser.
*   **Content**: Renders Markdown/MDX content dynamically.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT License](LICENSE)
