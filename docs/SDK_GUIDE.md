# GroqTales SDK Developer Guide

## Overview

The GroqTales SDK provides developers with easy-to-use tools for integrating AI-powered storytelling
capabilities into their applications. Built for modern JavaScript/TypeScript applications.

## Quick Start

### Installation

```bash
npm install @groqtales/sdk
# or
yarn add @groqtales/sdk
```

### Basic Usage

```typescript
import { GroqTalesSDK } from '@groqtales/sdk';

const sdk = new GroqTalesSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://groqtales-backend-api.onrender.com',
});

// Generate a story
const story = await sdk.stories.generate({
  prompt: 'Write a fantasy story about a magical forest',
  genre: 'fantasy',
  length: 'medium',
});

console.log(story.content);
```

## SDK Methods

### Stories

#### `sdk.stories.generate(options)`

Generate AI-powered stories.

```typescript
const story = await sdk.stories.generate({
  prompt: string,
  genre: string,
  length: 'short' | 'medium' | 'long',
  style: string,
  temperature: number,
});
```

#### `sdk.stories.analyze(content)`

Analyze story content for themes and sentiment.

```typescript
const analysis = await sdk.stories.analyze('Story content...');
// Returns: { sentiment, themes, readabilityScore, wordCount }
```

#### `sdk.stories.list(options)`

Get paginated list of stories.

```typescript
const stories = await sdk.stories.list({
  page: 1,
  limit: 10,
  genre: 'fantasy',
});
```

### AI Content

#### `sdk.ai.generate(options)`

Generate content using various AI models.

```typescript
const content = await sdk.ai.generate({
  prompt: 'Generate creative content...',
  model: 'llama-3-70b',
  parameters: {
    temperature: 0.7,
    max_tokens: 1000,
  },
});
```

#### `sdk.ai.analyze(content, type)`

Analyze content with AI.

```typescript
const analysis = await sdk.ai.analyze(
  'Content to analyze...',
  'sentiment' // or 'themes', 'style', etc.
);
```

### NFT Integration

#### `sdk.nft.mint(storyId, metadata)`

Mint NFT from story content.

```typescript
const nft = await sdk.nft.mint('story123', {
  name: 'My Story NFT',
  description: 'AI-generated story NFT',
  attributes: [
    { trait_type: 'Genre', value: 'Fantasy' },
    { trait_type: 'Length', value: 'Medium' },
  ],
});
```

#### `sdk.nft.list(options)`

Get NFT marketplace listings.

```typescript
const listings = await sdk.nft.list({
  category: 'stories',
  priceRange: { min: 0.1, max: 1.0 },
});
```

## Configuration

### SDK Options

```typescript
interface SDKOptions {
  apiKey: string; // Your API key
  baseUrl?: string; // API base URL
  timeout?: number; // Request timeout (ms)
  retries?: number; // Number of retries
  rateLimit?: {
    // Rate limiting options
    requests: number;
    window: number;
  };
}
```

### Environment Variables

```bash
GROQTALES_API_KEY=your-api-key
GROQTALES_BASE_URL=https://groqtales-backend-api.onrender.com
```

## Error Handling

The SDK provides comprehensive error handling:

```typescript
import { GroqTalesError, APIError, ValidationError } from '@groqtales/sdk';

try {
  const story = await sdk.stories.generate({
    prompt: 'Write a story...',
  });
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message, error.status);
  } else if (error instanceof ValidationError) {
    console.error('Validation Error:', error.message);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

## React Integration

### Hook Usage

```typescript
import { useGroqTales } from '@groqtales/react-sdk';

function StoryGenerator() {
  const { generateStory, loading, error } = useGroqTales();

  const handleGenerate = async () => {
    const story = await generateStory({
      prompt: 'Write a sci-fi story...',
      genre: 'sci-fi',
    });
    console.log(story);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Story'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Provider Setup

```typescript
import { GroqTalesProvider } from '@groqtales/react-sdk';

function App() {
  return (
    <GroqTalesProvider apiKey="your-api-key">
      <StoryGenerator />
    </GroqTalesProvider>
  );
}
```

## Advanced Features

### Custom Models

```typescript
// Use custom AI models
const story = await sdk.ai.generate({
  prompt: 'Write a story...',
  model: 'custom-model-id',
  parameters: {
    temperature: 0.8,
    top_p: 0.9,
    frequency_penalty: 0.1,
  },
});
```

### Streaming Responses

```typescript
// Stream story generation
const stream = sdk.stories.generateStream({
  prompt: 'Write a long story...',
});

for await (const chunk of stream) {
  console.log(chunk.content);
}
```

### Batch Operations

```typescript
// Generate multiple stories
const stories = await sdk.stories.generateBatch([
  { prompt: 'Fantasy story...', genre: 'fantasy' },
  { prompt: 'Sci-fi story...', genre: 'sci-fi' },
  { prompt: 'Mystery story...', genre: 'mystery' },
]);
```

## Examples

### Complete Story App

```typescript
import { GroqTalesSDK } from '@groqtales/sdk';

class StoryApp {
  private sdk: GroqTalesSDK;

  constructor(apiKey: string) {
    this.sdk = new GroqTalesSDK({ apiKey });
  }

  async createStory(prompt: string, genre: string) {
    // Generate story
    const story = await this.sdk.stories.generate({
      prompt,
      genre,
      length: 'medium',
    });

    // Analyze content
    const analysis = await this.sdk.stories.analyze(story.content);

    // Mint as NFT
    const nft = await this.sdk.nft.mint(story.id, {
      name: story.title,
      description: `${genre} story with ${analysis.sentiment} sentiment`,
      attributes: [
        { trait_type: 'Genre', value: genre },
        { trait_type: 'Sentiment', value: analysis.sentiment },
        { trait_type: 'Word Count', value: analysis.wordCount.toString() },
      ],
    });

    return { story, analysis, nft };
  }
}
```

## Best Practices

1. **API Key Security**: Never expose API keys in client-side code
2. **Rate Limiting**: Implement proper rate limiting in your application
3. **Error Handling**: Always handle errors gracefully
4. **Caching**: Cache responses when appropriate to reduce API calls
5. **Validation**: Validate inputs before sending to the API

## Support & Resources

- **Documentation**: [docs.groqtales.com](https://docs.groqtales.com)
- **GitHub**: [github.com/Drago-03/GroqTales](https://github.com/Drago-03/GroqTales)
- **Discord**: [Join our community](https://discord.gg/groqtales)
- **Email**: <support@groqtales.com>

## Changelog

### v1.0.0

- Initial SDK release
- Core story generation and analysis
- NFT integration
- React hooks and providers
