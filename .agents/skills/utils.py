import os
import sys
import re
import requests
from bs4 import BeautifulSoup
from openai import OpenAI

def get_openai_client(api_key=None):
    key = api_key or os.environ.get("OPENAI_API_KEY")
    if not key:
        print("Error: OpenAI API Key is required. Set OPENAI_API_KEY env var or use --api-key.")
        sys.exit(1)
    return OpenAI(api_key=key)

def generate_text(client, prompt, model="gpt-4o", system_prompt="You are a helpful assistant."):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating text: {e}")
        return None

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

def clean_llm_response(text):
    if not text:
        return text
    # Regex to find the first code block, ignoring surrounding text
    # ```[a-zA-Z]*\n? matches the opening fence (potentially with language)
    # ([\s\S]*?) matches the content non-greedily
    # \n?``` matches the closing fence
    match = re.search(r"```[a-zA-Z]*\n?([\s\S]*?)\n?```", text)
    if match:
        return match.group(1).strip()
    return text.strip()
