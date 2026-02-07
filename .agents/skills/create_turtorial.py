#!/usr/bin/env python3
import argparse
import os
import sys
import yaml
from utils import get_openai_client, generate_text, clean_llm_response

def create_turtorial(name, description, api_key=None):
    client = get_openai_client(api_key)

    print(f"Designing environment for tutorial '{name}' based on: {description}")

    prompt = f"""
    Create a Dockerfile for a tutorial environment.
    Tutorial Name: {name}
    Description of environment needs: {description}

    Base Image: The Dockerfile MUST start with `FROM turtorial:latest`.
    This base image already includes Ubuntu 24.04, Java 25, Maven, Gradle, and common tools (git, curl, vim, nano).

    Your task is to add any additional tools or configurations required by the description.

    Also, set the environment variable `TURTORIAL_LESSONS_DIRECTORY` to `classpath:/lessons/{name}`.

    Output ONLY the content of the Dockerfile. Do not include markdown code blocks.
    """

    dockerfile_content = generate_text(client, prompt, system_prompt="You are a DevOps expert writing Dockerfiles.")
    if not dockerfile_content:
        return

    # Clean up potential markdown code blocks
    dockerfile_content = clean_llm_response(dockerfile_content)

    # Create lesson directory
    lesson_dir = f"src/main/resources/lessons/{name}"
    os.makedirs(lesson_dir, exist_ok=True)

    # Create lesson.yml
    lesson_meta = {
        "title": name.replace("-", " ").title(),
        "description": description
    }
    with open(os.path.join(lesson_dir, "lesson.yml"), "w") as f:
        yaml.dump(lesson_meta, f)

    # Write Dockerfile
    dockerfile_path = f"turtorial-{name}.Dockerfile"
    with open(dockerfile_path, "w") as f:
        f.write(dockerfile_content)

    print(f"Tutorial scaffold created!")
    print(f" - Lesson directory: {lesson_dir}")
    print(f" - Lesson metadata: {lesson_dir}/lesson.yml")
    print(f" - Standalone Dockerfile: {dockerfile_path}")
    print(f"To build: docker build -f {dockerfile_path} -t turtorial-{name} .")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a tutorial scaffold (Dockerfile and lesson dir).")
    parser.add_argument("--name", required=True, help="Slug/directory name for the tutorial")
    parser.add_argument("--description", required=True, help="Description of the environment and tutorial goal")
    parser.add_argument("--api-key", help="OpenAI API Key")

    args = parser.parse_args()
    create_turtorial(args.name, args.description, args.api_key)
