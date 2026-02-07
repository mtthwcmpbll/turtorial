#!/usr/bin/env python3
import argparse
import os
import sys
from utils import get_openai_client, generate_text, clean_llm_response

def update_lesson(filepath, instruction, api_key=None):
    if not os.path.exists(filepath):
        print(f"Error: File '{filepath}' not found.")
        sys.exit(1)

    with open(filepath, "r") as f:
        content = f.read()

    client = get_openai_client(api_key)

    prompt = f"""
    Update the following file based on the instruction provided.

    File Content:
    {content}

    Instruction:
    {instruction}

    Output ONLY the full updated content of the file. Do not include markdown code blocks.
    """

    updated_content = generate_text(client, prompt, system_prompt="You are a helpful coding assistant.")

    if updated_content:
        # Clean up potential markdown code blocks safely
        updated_content = clean_llm_response(updated_content)

        with open(filepath, "w") as f:
            f.write(updated_content)
        print(f"Updated {filepath}")
    else:
        print("Failed to update file.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update an existing lesson file.")
    parser.add_argument("--file", required=True, help="Path to the lesson file (.mdx or .yml)")
    parser.add_argument("--instruction", required=True, help="Instruction for the update")
    parser.add_argument("--api-key", help="OpenAI API Key")

    args = parser.parse_args()
    update_lesson(args.file, args.instruction, args.api_key)
