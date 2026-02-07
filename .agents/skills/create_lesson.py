#!/usr/bin/env python3
import argparse
import os
import sys
import yaml
import json
from utils import get_openai_client, scrape_url, clean_llm_response

def generate_lesson_plan(client, topic, objectives, level, content=""):
    prompt = f"""
    Create a tutorial lesson plan for the topic: "{topic}".
    Target Audience Level: {level}
    Learning Objectives: {objectives}

    Source Material (use this as context if provided):
    {content}

    The output must be a valid JSON object with the following structure:
    {{
        "title": "Lesson Title",
        "description": "Brief description of the lesson.",
        "steps": [
            {{
                "title": "Step Title",
                "section": "Section Name",
                "content": "The MDX content for this step. Use markdown formatting. Include code examples and explanation.",
                "order": 1
            }},
            ...
        ]
    }}

    Ensure the content is educational, interactive, and follows a logical progression.
    The "content" field should be the actual tutorial text for that step, formatted in MDX.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert technical writer creating interactive tutorials."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        # Clean potential markdown wrapping before parsing
        json_str = clean_llm_response(response.choices[0].message.content)
        return json.loads(json_str)
    except Exception as e:
        print(f"Error generating lesson plan: {e}")
        return None

def create_lesson(tutorial_slug, topic, objectives, level, url=None, api_key=None):
    client = get_openai_client(api_key)

    lesson_dir = f"src/main/resources/lessons/{tutorial_slug}"
    if not os.path.exists(lesson_dir):
        print(f"Error: Lesson directory '{lesson_dir}' does not exist. Run create-turtorial first.")
        sys.exit(1)

    content = ""
    if url:
        print(f"Scraping {url}...")
        scraped = scrape_url(url)
        if scraped:
            content += f"\nSource Content:\n{scraped}\n"

    print(f"Generating lesson content for '{topic}' in '{tutorial_slug}'...")
    lesson_data = generate_lesson_plan(client, topic, objectives, level, content)

    if not lesson_data:
        print("Failed to generate lesson content.")
        sys.exit(1)

    # Determine starting order based on existing files
    existing_files = [f for f in os.listdir(lesson_dir) if f.endswith(".md") or f.endswith(".mdx")]
    start_order = len(existing_files) + 1

    # Write steps
    for i, step in enumerate(lesson_data.get("steps", [])):
        order = start_order + i
        filename = f"{order:02d}-{step['title'].lower().replace(' ', '-')}.mdx"
        filepath = os.path.join(lesson_dir, filename)

        frontmatter = {
            "title": step['title'],
            "section": step.get('section', 'General'),
            "order": order
        }

        with open(filepath, "w") as f:
            f.write("---\n")
            yaml.dump(frontmatter, f)
            f.write("---\n\n")
            f.write(step['content'])

    print(f"Added {len(lesson_data.get('steps', []))} steps to {lesson_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create lesson content (MDX steps).")
    parser.add_argument("--tutorial", required=True, help="Slug/directory name of the existing tutorial")
    parser.add_argument("--topic", required=True, help="Topic of the new lesson content")
    parser.add_argument("--objectives", required=True, help="Learning objectives")
    parser.add_argument("--level", default="Beginner", help="Target skill level")
    parser.add_argument("--url", help="URL to source documentation")
    parser.add_argument("--api-key", help="OpenAI API Key")

    args = parser.parse_args()
    create_lesson(args.tutorial, args.topic, args.objectives, args.level, args.url, args.api_key)
