import argparse
import os
import sys
import json
import yaml
import requests
from bs4 import BeautifulSoup
from openai import OpenAI

def scrape_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        # Extract main content - simple heuristic: look for article, main, or body
        content = soup.find('article') or soup.find('main') or soup.body
        return content.get_text(separator='\n', strip=True)[:10000] # Limit content size
    except Exception as e:
        print(f"Error scraping URL: {e}")
        return None

def generate_lesson_plan(client, topic, content, objectives, level):
    prompt = f"""
    Create a tutorial lesson plan for the topic: "{topic}".
    Target Audience Level: {level}
    Learning Objectives: {objectives}

    Source Material:
    {content}

    The output must be a valid JSON object with the following structure:
    {{
        "title": "Lesson Title",
        "description": "Brief description of the lesson.",
        "steps": [
            {{
                "title": "Step Title",
                "section": "Section Name",
                "content": "The MDX content for this step. Use markdown formatting.",
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
            model="gpt-4o", # Or gpt-3.5-turbo
            messages=[
                {"role": "system", "content": "You are an expert technical writer creating interactive tutorials."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error generating lesson plan: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Create a new tutorial lesson using AI.")
    parser.add_argument("--topic", help="The topic of the tutorial")
    parser.add_argument("--url", help="URL to source documentation")
    parser.add_argument("--objectives", help="Learning objectives")
    parser.add_argument("--level", default="Beginner", help="Target skill level")
    parser.add_argument("--output-dir", default="src/main/resources/lessons", help="Output directory for lessons")
    parser.add_argument("--name", required=True, help="Slug/directory name for the lesson")
    parser.add_argument("--standalone", action="store_true", help="Generate a Dockerfile for a standalone tutorial")
    parser.add_argument("--api-key", help="OpenAI API Key (optional, defaults to OPENAI_API_KEY env var)")

    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OpenAI API Key is required. Set OPENAI_API_KEY env var or use --api-key.")
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    content = ""
    if args.url:
        print(f"Scraping {args.url}...")
        scraped = scrape_url(args.url)
        if scraped:
            content += f"\nSource Content:\n{scraped}\n"

    if not args.topic and not content:
        print("Error: Either --topic or --url must be provided.")
        sys.exit(1)

    topic = args.topic or "Tutorial based on provided URL"

    print(f"Generating lesson plan for '{topic}'...")
    lesson_data = generate_lesson_plan(client, topic, content, args.objectives, args.level)

    if not lesson_data:
        print("Failed to generate lesson plan.")
        sys.exit(1)

    lesson_dir = os.path.join(args.output_dir, args.name)
    os.makedirs(lesson_dir, exist_ok=True)

    # Write lesson.yml
    lesson_meta = {
        "title": lesson_data.get("title", topic),
        "description": lesson_data.get("description", "")
    }
    with open(os.path.join(lesson_dir, "lesson.yml"), "w") as f:
        yaml.dump(lesson_meta, f)

    # Write steps
    for i, step in enumerate(lesson_data.get("steps", [])):
        filename = f"{i+1:02d}-{step['title'].lower().replace(' ', '-')}.mdx"
        filepath = os.path.join(lesson_dir, filename)

        frontmatter = {
            "title": step['title'],
            "section": step.get('section', 'General'),
            "order": step.get('order', i+1)
        }

        with open(filepath, "w") as f:
            f.write("---\n")
            yaml.dump(frontmatter, f)
            f.write("---\n\n")
            f.write(step['content'])

    print(f"Lesson created at {lesson_dir}")

    if args.standalone:
        dockerfile_content = f"""
FROM turtorial:latest

ENV TURTORIAL_LESSONS_DIRECTORY=classpath:/lessons/{args.name}
"""
        dockerfile_path = os.path.join(lesson_dir, "Dockerfile")
        with open(dockerfile_path, "w") as f:
            f.write(dockerfile_content.strip())
        print(f"Standalone Dockerfile created at {dockerfile_path}")
        print(f"To build: docker build -f {dockerfile_path} -t turtorial-{args.name} .")

if __name__ == "__main__":
    main()
