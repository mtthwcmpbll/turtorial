# Agent Skills

This repository includes skills designed for AI agents to assist with development and content creation.

## Create Tutorial Skill

The `scripts/create_tutorial.py` script allows you to generate new tutorials or add lessons to existing ones using AI.

### Usage

```bash
python3 scripts/create_tutorial.py --name <slug> [options]
```

### Arguments

*   `--name <slug>`: **Required**. The directory name for the lesson (e.g., `intro-to-python`).
*   `--topic <topic>`: The topic of the tutorial.
*   `--url <url>`: URL to source documentation to scrape and use as context.
*   `--objectives <text>`: Learning objectives for the lesson.
*   `--level <level>`: Target skill level (default: "Beginner").
*   `--output-dir <path>`: Output directory for lessons (default: `src/main/resources/lessons`).
*   `--standalone`: Generate a `Dockerfile` for a standalone tutorial.
*   `--api-key <key>`: OpenAI API Key (can also be set via `OPENAI_API_KEY` env var).

### Example

To create a standalone tutorial on "Advanced Java" based on a URL:

```bash
export OPENAI_API_KEY=sk-...
python3 scripts/create_tutorial.py \
  --name advanced-java \
  --topic "Advanced Java Features" \
  --url https://docs.oracle.com/en/java/ \
  --level "Advanced" \
  --standalone
```

This will:
1.  Scrape the provided URL.
2.  Generate a lesson structure (YAML metadata and MDX steps).
3.  Save files to `src/main/resources/lessons/advanced-java`.
4.  Create `src/main/resources/lessons/advanced-java/Dockerfile`.

### Building Standalone Tutorial

If `--standalone` was used:

```bash
docker build -f src/main/resources/lessons/advanced-java/Dockerfile -t turtorial-advanced-java .
docker run -p 8080:8080 turtorial-advanced-java
```

### Dependencies

Ensure dependencies are installed:

```bash
pip install -r scripts/requirements.txt
```
