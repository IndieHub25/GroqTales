#!/usr/bin/env python3

import os
import glob
import json
from pathlib import Path
import random
import argparse
import time
import requests
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Any

# For potential future Groq API interactions
try:
    from groq import Groq
except ImportError:
    print("Groq SDK not installed. Install with 'pip install groq' for inference capabilities.")
    Groq = None

# For Hugging Face Transformers (placeholder for training)
try:
    from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
    from datasets import Dataset
except ImportError:
    print("Transformers or datasets not installed. Install with 'pip install transformers datasets' for training capabilities.")
    AutoModelForCausalLM = AutoTokenizer = TrainingArguments = Trainer = Dataset = None

class StoryDatasetProcessor:
    def __init__(self, base_dir: str = "datasets"):
        self.base_dir = Path(base_dir)
        self.stories: List[Dict[str, Any]] = []
        self.genre_combinations: List[Dict[str, Any]] = []
        self.genre_map = {
            'fantasy': 'Fantasy',
            'sci-fi': 'Sci-Fi',
            'horror': 'Horror',
            'romance': 'Romance',
            'adventure': 'Adventure',
            'historical': 'Historical',
            'educational': 'Educational',
            'magical-realism': 'Magical-Realism'
        }
        self.scraped_stories: List[Dict[str, Any]] = []

    def collect_stories(self) -> None:
        """Collect stories from individual genre folders."""
        genre_dirs = self.base_dir.glob("[a-zA-Z]*")
        for genre_dir in genre_dirs:
            if genre_dir.is_dir() and genre_dir.name != "genre-combinations":
                genre = genre_dir.name
                story_files = genre_dir.glob("story*.txt")
                for story_file in story_files:
                    with open(story_file, 'r', encoding='utf-8') as f:
                        content = f.read().strip()
                    self.stories.append({
                        "genre": genre,
                        "content": content,
                        "source": str(story_file)
                    })
                    print(f"Collected story from {story_file}")

    def collect_genre_combinations(self) -> None:
        """Collect stories from genre combination folders."""
        combo_dir = self.base_dir / "genre-combinations"
        if combo_dir.exists():
            combo_dirs = combo_dir.glob("*")
            for combo_genre_dir in combo_dirs:
                if combo_genre_dir.is_dir():
                    genres = combo_genre_dir.name.split('-')
                    story_files = combo_genre_dir.glob("story*.txt")
                    for story_file in story_files:
                        with open(story_file, 'r', encoding='utf-8') as f:
                            content = f.read().strip()
                        self.genre_combinations.append({
                            "genres": genres,
                            "content": content,
                            "source": str(story_file)
                        })
                        print(f"Collected combination story from {story_file}")

    def scrape_stories(self, max_stories_per_genre: int = 5, delay: float = 2.0) -> None:
        """Scrape stories from Project Gutenberg for each genre."""
        base_url = "https://www.gutenberg.org/ebooks/search/?query="
        for genre, formatted_genre in self.genre_map.items():
            genre_dir = self.base_dir / genre
            if not genre_dir.exists():
                genre_dir.mkdir(parents=True)
            query = f"{genre}+fiction"
            url = base_url + query.replace(' ', '+')
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    book_links = soup.find_all('li', class_='booklink')[:max_stories_per_genre]
                    count = 0
                    for link in book_links:
                        title = link.find('span', class_='title').text if link.find('span', class_='title') else 'Untitled'
                        book_url = 'https://www.gutenberg.org' + link.find('a')['href'] + '.txt.utf-8'
                        time.sleep(delay)  # Respectful delay to avoid overloading server
                        book_response = requests.get(book_url, timeout=10)
                        if book_response.status_code == 200:
                            content = book_response.text
                            # Extract a snippet (first 500-1000 words) to keep stories manageable
                            snippet = ' '.join(content.split()[:800])
                            if len(snippet) > 100:  # Ensure it's substantial
                                self.scraped_stories.append({
                                    "genre": genre,
                                    "title": title,
                                    "content": snippet,
                                    "source": book_url
                                })
                                # Save to file
                                existing_files = list(genre_dir.glob("story*.txt"))
                                next_num = len(existing_files) + 1
                                with open(genre_dir / f"story{next_num}.txt", 'w', encoding='utf-8') as f:
                                    f.write(snippet)
                                print(f"Scraped and saved story '{title}' for genre {genre} from {book_url}")
                                count += 1
                                if count >= max_stories_per_genre:
                                    break
                        else:
                            print(f"Failed to fetch book content from {book_url}")
                else:
                    print(f"Failed to fetch search results for {genre}")
                time.sleep(delay)  # Delay between genre searches
            except Exception as e:
                print(f"Error scraping stories for {genre}: {e}")

    def prepare_training_data(self, output_file: str = "training_data.json") -> None:
        """Prepare a JSON file with formatted prompts and responses for training."""
        training_data = []
        for story in self.stories + self.scraped_stories:
            prompt = f"Write a story in the {story['genre']} genre."
            training_data.append({
                "prompt": prompt,
                "response": story['content'],
                "metadata": {"genre": story['genre'], "source": story['source']}
            })
        for combo in self.genre_combinations:
            genres_str = ' and '.join(combo['genres'])
            prompt = f"Write a story blending the genres of {genres_str}."
            training_data.append({
                "prompt": prompt,
                "response": combo['content'],
                "metadata": {"genres": combo['genres'], "source": combo['source']}
            })
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(training_data, f, indent=2)
        print(f"Prepared training data with {len(training_data)} entries, saved to {output_file}")

class ModelTrainer:
    def __init__(self, data_file: str = "training_data.json", model_name: str = "gpt2"):
        self.data_file = data_file
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.dataset = None

    def load_data(self) -> None:
        """Load the prepared training data."""
        if not os.path.exists(self.data_file):
            raise FileNotFoundError(f"Training data file {self.data_file} not found.")
        with open(self.data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Format for Hugging Face datasets
        prompts = [entry['prompt'] for entry in data]
        responses = [entry['response'] for entry in data]
        self.dataset = Dataset.from_dict({
            "prompt": prompts,
            "response": responses
        })
        print(f"Loaded {len(prompts)} training examples.")

    def initialize_model(self) -> None:
        """Initialize the model and tokenizer for training."""
        if AutoModelForCausalLM is None or AutoTokenizer is None:
            raise ImportError("Transformers library not installed. Cannot initialize model.")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        # Set padding token if not already set (for models like GPT-2)
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        print(f"Initialized model {self.model_name} for training.")

    def tokenize_data(self) -> None:
        """Tokenize the dataset for training."""
        if self.dataset is None or self.tokenizer is None:
            raise ValueError("Dataset or tokenizer not initialized.")
        def tokenize_function(examples):
            inputs = self.tokenizer(examples['prompt'], padding='max_length', truncation=True, max_length=128)
            outputs = self.tokenizer(examples['response'], padding='max_length', truncation=True, max_length=512)
            inputs['labels'] = outputs['input_ids']
            return inputs
        self.dataset = self.dataset.map(tokenize_function, batched=True)
        print("Tokenized dataset for training.")

    def train_model(self, output_dir: str = "trained_model", epochs: int = 3) -> None:
        """Train the model using the prepared dataset."""
        if self.model is None or self.dataset is None:
            raise ValueError("Model or dataset not initialized.")
        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=epochs,
            per_device_train_batch_size=4,
            save_steps=10_000,
            save_total_limit=2,
            logging_dir='./logs',
            logging_steps=200,
        )
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=self.dataset,
        )
        trainer.train()
        trainer.save_model(output_dir)
        if self.tokenizer:
            self.tokenizer.save_pretrained(output_dir)
        print(f"Model training completed, saved to {output_dir}")

class GroqInference:
    def __init__(self, api_key: str = None):
        if Groq is None:
            raise ImportError("Groq SDK not installed. Install with 'pip install groq'.")
        self.client = Groq(api_key=api_key) if api_key else Groq()
        self.model = "llama3-8b-8192"  # Default model, can be adjusted
        self.prompt_history: List[Dict[str, Any]] = []

    def generate_response(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate a response using Groq API for inference."""
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a creative storyteller specializing in blending multiple genres into cohesive, engaging narratives. Your stories are vivid, well-structured, and emotionally impactful."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=max_tokens,
                top_p=0.9,
                stream=False
            )
            response = completion.choices[0].message.content.strip()
            self.prompt_history.append({
                "prompt": prompt,
                "response": response,
                "timestamp": time.time()
            })
            return response
        except Exception as e:
            print(f"Error generating response with Groq: {e}")
            return "Unable to generate response due to API error."

    def refine_prompt(self, base_prompt: str, max_attempts: int = 3) -> str:
        """Refine a prompt based on past responses to improve quality."""
        if not self.prompt_history:
            return base_prompt
        # Analyze past responses for length, detail, and genre adherence (basic heuristic)
        relevant_history = [h for h in self.prompt_history if base_prompt in h['prompt']][-max_attempts:]
        if not relevant_history:
            return base_prompt
        last_response = relevant_history[-1]['response']
        # Simple heuristic: if response is too short, ask for more detail
        if len(last_response.split()) < 100:
            return f"{base_prompt} Please provide a detailed story with rich descriptions and character development."
        # If response lacks genre elements (basic check), emphasize genre
        elif any(genre in base_prompt.lower() for genre in ['fantasy', 'horror', 'sci-fi']) and 'magic' not in last_response.lower() and 'terror' not in last_response.lower() and 'space' not in last_response.lower():
            return f"{base_prompt} Ensure the story strongly reflects the specified genre elements with vivid thematic details."
        return base_prompt

    def save_generated_story(self, genre_str: str, content: str) -> None:
        """Save a generated story to the appropriate genre or combination folder."""
        if '-' in genre_str:  # Combination
            genres = genre_str.split('-')
            folder_name = '-'.join([self._format_genre(g) for g in genres])
            target_dir = self.base_dir / "genre-combinations" / folder_name
        else:  # Single genre
            genre = self._format_genre(genre_str)
            target_dir = self.base_dir / genre.lower()
        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)
        existing_files = list(target_dir.glob("story*.txt"))
        next_num = len(existing_files) + 1
        with open(target_dir / f"story{next_num}.txt", 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved generated story to {target_dir / f'story{next_num}.txt'}")

    def _format_genre(self, genre: str) -> str:
        """Format genre name for folder structure."""
        genre = genre.lower().replace(' ', '-')
        for k, v in {'sci-fi': 'Sci-Fi', 'magical-realism': 'Magical-Realism'}.items():
            if genre == k:
                return v
        return genre.capitalize()

def main():
    parser = argparse.ArgumentParser(description="Train a language model on story datasets, scrape new stories, and perform inference with Groq.")
    parser.add_argument("--train", action="store_true", help="Run the training process.")
    parser.add_argument("--inference", action="store_true", help="Run inference with Groq API.")
    parser.add_argument("--scrape", action="store_true", help="Scrape new stories from the web to update datasets.")
    parser.add_argument("--api-key", type=str, help="Groq API key for inference.")
    parser.add_argument("--model", type=str, default="gpt2", help="Model name for training (default: gpt2).")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs (default: 3).")
    parser.add_argument("--prompt", type=str, help="Prompt for inference.")
    parser.add_argument("--max-scrape", type=int, default=5, help="Max stories to scrape per genre (default: 5).")
    args = parser.parse_args()

    # Process dataset
    processor = StoryDatasetProcessor()
    processor.collect_stories()
    processor.collect_genre_combinations()

    if args.scrape:
        print("Starting web scraping to update datasets...")
        processor.scrape_stories(max_stories_per_genre=args.max_scrape)
        print("Web scraping completed.")

    processor.prepare_training_data()

    if args.train:
        try:
            trainer = ModelTrainer(data_file="training_data.json", model_name=args.model)
            trainer.load_data()
            trainer.initialize_model()
            trainer.tokenize_data()
            trainer.train_model(epochs=args.epochs)
        except ImportError as e:
            print(f"Cannot run training: {e}")
            print("Training is a placeholder since Groq does not support direct model training. Use Hugging Face or another platform for actual training.")

    if args.inference:
        if not args.api_key:
            print("Warning: No API key provided. Ensure GROQ_API_KEY environment variable is set or provide --api-key.")
        try:
            inferencer = GroqInference(api_key=args.api_key)
            prompt = args.prompt if args.prompt else "Write a short story blending the genres of Fantasy and Horror."
            refined_prompt = inferencer.refine_prompt(prompt)
            print(f"Using refined prompt: {refined_prompt}")
            response = inferencer.generate_response(refined_prompt)
            print("Generated Response:")
            print(response)
            # Extract genre from prompt for saving
            genre_match = re.search(r'(?:genres of|genre) ([A-Za-z-]+(?: and [A-Za-z-]+)*)', prompt)
            genre_str = genre_match.group(1) if genre_match else 'Fantasy-Horror'
            inferencer.save_generated_story(genre_str, response)
        except ImportError as e:
            print(f"Cannot run inference: {e}")
        except Exception as e:
            print(f"Error during inference: {e}")

if __name__ == "__main__":
    main()
