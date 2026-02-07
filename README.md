# Turtorial 🐢

**Welcome to Turtorial!**

Turtorial is an open-source platform that helps you create interactive, terminal-based coding lessons. Whether you're a developer advocate, technical writer, or educator, Turtorial makes it easy to build hands-on learning experiences that run directly in the browser.

## ✨ Why Turtorial?

*   **Real Terminal Experience**: Users run real commands in a live terminal, not a simulation.
*   **Simple Authoring**: Write lessons using standard Markdown or MDX. No complex IDE needed.
*   **Interactive Learning**: Embed quizzes and check understanding instantly.
*   **Automated Environments**: Set up and tear down environments automatically with lifecycle scripts.

## 📚 Creating Your First Lesson

Building a lesson is as simple as writing a Markdown file.

### 1. Structure Your Lesson

Each lesson gets its own folder. Inside, you'll need a `lesson.yml` for metadata and your step files.

```
my-lessons/                # Your local lessons folder
└── my-first-lesson/       # A specific lesson
    ├── lesson.yml         # Lesson details
    ├── 01-intro.mdx       # Step 1
    ├── 02-setup.mdx       # Step 2
    └── ...
```

### 2. Define Lesson Metadata

Create a `lesson.yml` file to give your lesson a title and description.

```yaml
title: My First Lesson
description: Learn the basics of command line tools!
```

### 3. Write Steps in Markdown

Each step is a separate file. Use YAML frontmatter at the top to configure the step.

**Example: `01-intro.mdx`**

```markdown
---
title: Welcome
order: 1
section: Getting Started
---

# Hello, World!

Welcome to your first interactive lesson. Run the command below to get started:

```bash
echo "Hello from Turtorial!"
```
```

### 4. Add Interactivity

Make your lessons engaging by adding quizzes directly in the frontmatter.

```yaml
---
title: Quick Quiz
quizzes:
  - question: Which command lists files in a directory?
    type: CHOICE
    options:
      - cd
      - ls
    correctAnswer: ls
---
```

## 📦 Packaging & Distributing Your Lesson

The recommended way to distribute your lesson is by building a Docker image based on the official Turtorial image. This allows you to bundle your lessons with exactly the tools and environment they need.

### 1. Create a `Dockerfile`

Create a `Dockerfile` in the root of your project:

```dockerfile
# Start from the base Turtorial image
FROM ghcr.io/mtthwcmpbll/turtorial:latest

# Switch to root to install system dependencies
USER root

# Set the active profile to 'production'
# This ensures lessons are loaded from /app/lessons instead of the classpath
ENV SPRING_PROFILES_ACTIVE=production

# Install any tools your lesson requires
# Example: Installing Python and Git
RUN apt-get update && apt-get install -y \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy your lessons into the container
COPY ./my-lessons /app/lessons

# Switch back to the non-root user for security
USER turtorial
```

### 2. Build Your Image

Build your custom Docker image:

```bash
docker build -t my-awesome-lesson .
```

### 3. Run Your Lesson

Start the container:

```bash
docker run -p 8080:8080 my-awesome-lesson
```

Open your browser to `http://localhost:8080` to see your lesson in action!

## 🤝 Contributing

We love contributions! If you're a developer looking to improve the platform itself (the Java backend or React frontend), check out [BUILDING.md](BUILDING.md) for technical build instructions.

## 📄 License

[MIT License](LICENSE)
