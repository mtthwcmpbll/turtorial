# Agent Skills

This repository includes skills designed for AI agents to assist with development and content creation.

## Turtorial Skills

The following skills are available for creating and managing tutorials.

### `turtorial-create-turtorial`

Creates the container scaffold (Dockerfile and directory structure) for a new tutorial.

**Usage:**
```bash
.agents/claude/turtorial-create-turtorial --name <slug> --description <description>
```

**Arguments:**
*   `--name`: Slug/directory name for the tutorial (e.g., `intro-to-python`).
*   `--description`: Description of the environment and tutorial goal (e.g., "A Python environment with NumPy and Pandas").

### `turtorial-create-lesson`

Adds a new lesson (MDX content) to an existing tutorial.

**Usage:**
```bash
.agents/claude/turtorial-create-lesson --tutorial <slug> --topic <topic> --objectives <text> --level <level> [--url <url>]
```

**Arguments:**
*   `--tutorial`: Slug of the existing tutorial (e.g., `intro-to-python`).
*   `--topic`: The topic of the new lesson.
*   `--objectives`: Learning objectives.
*   `--level`: Target skill level (default: "Beginner").
*   `--url`: URL to source documentation to scrape and use as context.

### `turtorial-update-lesson`

Enhances or modifies an existing lesson file.

**Usage:**
```bash
.agents/claude/turtorial-update-lesson --file <path> --instruction <text>
```

**Arguments:**
*   `--file`: Path to the lesson file (.mdx or .yml).
*   `--instruction`: Instruction for the update (e.g., "Fix typos", "Add an example").

### Dependencies

Ensure Python dependencies are installed:

```bash
pip install -r .agents/skills/requirements.txt
```

### Environment

Set the `OPENAI_API_KEY` environment variable to use these skills.
