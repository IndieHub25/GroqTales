#!/usr/bin/env python3
"""
Groq API Integration Examples

This script demonstrates how to use the Groq API for various natural language processing
tasks using the official Python client.

Usage:
  python3 scripts/groq-python-example.py

Requirements:
  pip install groq
"""

import os
import json
import time
from groq import Groq

# Set your API key - use the one from environment or the default one
API_KEY = os.environ.get("GROQ_API_KEY", "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")

# Initialize the Groq client
client = Groq(api_key=API_KEY)

# Available models
MODELS = {
    "llama3_70b": "llama-3.3-70b-versatile",
    "llama4_scout": "meta-llama/llama-4-scout-17b-16e-instruct",
    "mixtral": "mixtral-8x7b-32768",
    "gemma": "gemma-7b-it"
}

def print_separator():
    """Print a separator line for better readability"""
    print("\n" + "=" * 50 + "\n")

def test_basic_completion():
    """Test a basic completion with the Groq API"""
    print("BASIC COMPLETION EXAMPLE")

    start_time = time.time()
    completion = client.chat.completions.create(
        model=MODELS["llama4_scout"],
        messages=[
            {
                "role": "user",
                "content": "Explain the importance of fast language models in 3 bullet points"
            }
        ],
        temperature=0.7,
        max_tokens=200,
        stream=False
    )

    end_time = time.time()

    print(f"Response from {MODELS['llama4_scout']}:")
    print(completion.choices[0].message.content)
    print(f"\nTime taken: {(end_time - start_time):.2f} seconds")
    print(f"Total tokens: {completion.usage.total_tokens}")

def test_story_generation():
    """Test story generation with the Groq API"""
    print("STORY GENERATION EXAMPLE")

    start_time = time.time()
    completion = client.chat.completions.create(
        model=MODELS["llama3_70b"],
        messages=[
            {
                "role": "system",
                "content": "You are a creative writer who specializes in short science fiction stories."
            },
            {
                "role": "user",
                "content": "Write a very short story (200-300 words) about a person who discovers they can communicate with technology telepathically."
            }
        ],
        temperature=0.8,
        max_tokens=500,
        stream=False
    )

    end_time = time.time()

    print(f"Generated story (using {MODELS['llama3_70b']}):")
    print(completion.choices[0].message.content)
    print(f"\nTime taken: {(end_time - start_time):.2f} seconds")
    print(f"Total tokens: {completion.usage.total_tokens}")

def test_structured_output():
    """Test getting structured JSON output from the Groq API"""
    print("STRUCTURED JSON OUTPUT EXAMPLE")

    completion = client.chat.completions.create(
        model=MODELS["llama4_scout"],
        messages=[
            {
                "role": "system",
                "content": "You generate structured JSON data."
            },
            {
                "role": "user",
                "content": """
                Generate a JSON array with 3 book recommendations for science fiction fans.
                Each book should have these fields:
                - title
                - author
                - year
                - description (short, 1-2 sentences)
                - themes (array of strings)
                """
            }
        ],
        temperature=0.3,
        max_tokens=800,
        stream=False
    )

    response_text = completion.choices[0].message.content

    # Extract JSON from the response
    try:
        # Look for JSON array pattern
        import re
        json_match = re.search(r'\[\s*\{.*\}\s*\]', response_text, re.DOTALL)

        if json_match:
            books = json.loads(json_match.group(0))
            print(f"Successfully parsed {len(books)} book recommendations:")
            print(json.dumps(books, indent=2))
        else:
            print("Could not extract JSON. Raw response:")
            print(response_text)
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")
        print("Raw response:")
        print(response_text)

def test_streaming():
    """Test streaming response from the Groq API"""
    print("STREAMING EXAMPLE")
    print("Response will stream token by token:\n")

    stream = client.chat.completions.create(
        model=MODELS["mixtral"],
        messages=[
            {
                "role": "user",
                "content": "Write a haiku about artificial intelligence"
            }
        ],
        temperature=0.7,
        max_tokens=100,
        stream=True
    )

    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="", flush=True)
    print("\n\nStreaming complete!")

def main():
    """Run all examples"""
    print("\nGROQ API PYTHON EXAMPLES\n")
    print(f"Using API key: {API_KEY[:5]}...{API_KEY[-4:]}")

    try:
        # Run examples
        test_basic_completion()
        print_separator()

        test_story_generation()
        print_separator()

        test_structured_output()
        print_separator()

        test_streaming()
        print_separator()

        print("All examples completed successfully!")

    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    main()
