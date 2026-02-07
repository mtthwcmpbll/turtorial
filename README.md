# Turtorial 🐢

**Welcome to Turtorial!**

Turtorial is an open-source platform that helps you create interactive, terminal-based coding lessons. Whether you're a developer advocate, technical writer, or educator, Turtorial makes it easy to build hands-on learning experiences that run directly in the browser.

## ✨ Why Turtorial?

*   **Real Terminal Experience**: Users run real commands in a live terminal, not a simulation.
*   **Simple Authoring**: Write lessons using standard Markdown or MDX. No complex IDE needed.
*   **Interactive Learning**: Embed quizzes and check understanding instantly.
*   **Automated Environments**: Set up and tear down environments automatically with lifecycle scripts.

## 📚 Creating Your First Lesson

Building a lesson is as simple as writing a Markdown file. Lessons live in the `src/main/resources/lessons` directory.

### 1. Structure Your Lesson

Each lesson gets its own folder. Inside, you'll need a `lesson.yml` for metadata and your step files.

```
src/main/resources/lessons/
└── my-first-lesson/       # Your lesson folder
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

### 4. Add Interactivity with Quizzes

Make your lessons engaging by adding quizzes directly in the frontmatter.

**Multiple Choice:**

```yaml
---
title: Quick Quiz
quizzes:
  - question: Which command lists files in a directory?
    type: CHOICE
    options:
      - cd
      - ls
      - mkdir
    correctAnswer: ls
---
```

**Free Text Response:**

```yaml
---
title: Check Understanding
quizzes:
  - question: Type "success" to continue.
    type: TEXT
    validationRegex: "^success$"
---
```

### 5. Automate Setup & Cleanup

Need to prepare files or clean up after a step? Use `before` and `after` scripts.

```yaml
---
title: File Manipulation
before: touch /tmp/secret.txt
after: rm /tmp/secret.txt
---
```

## 🚀 Running Your Lesson

To preview and share your lessons, you'll need to run the Turtorial application.

For detailed instructions on building and running the platform locally or with Docker, please see our [BUILDING.md](BUILDING.md) guide.

## 🤝 Contributing

We love contributions! If you're a developer looking to improve the platform itself, check out [BUILDING.md](BUILDING.md) to get started with the codebase.

## 📄 License

[MIT License](LICENSE)
