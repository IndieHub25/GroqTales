# GroqTales Backend API Documentation

## Overview

The GroqTales Backend API provides comprehensive endpoints for AI-powered storytelling, NFT
management, user profiles, and content analysis. Built with Express.js and designed for scalability.

## Base URLs

- **Development**: `http://localhost:3001`
- **Production**: `https://groqtales-backend-api.onrender.com`

## Authentication

All API endpoints support optional API key authentication via headers:

```bash
X-API-Key: your-api-key-here
```

## API Endpoints

### Stories API (`/api/v1/stories`)

#### GET `/api/v1/stories`

Get paginated list of stories.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `genre` (string): Filter by genre
- `author` (string): Filter by author

**Response:**

```json
{
  "data": [
    {
      "id": "story123",
      "title": "The AI Chronicles",
      "content": "Story content...",
      "genre": "sci-fi",
      "author": "AI Assistant",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### POST `/api/v1/stories`

Create a new story.

**Request Body:**

```json
{
  "title": "Story Title",
  "content": "Story content...",
  "genre": "fantasy",
  "author": "Author Name"
}
```

#### POST `/api/v1/stories/generate`

Generate a story using AI.

**Request Body:**

```json
{
  "prompt": "Write a story about...",
  "genre": "fantasy",
  "length": "medium",
  "style": "narrative"
}
```

#### POST `/api/v1/stories/:id/analyze`

Analyze story content for themes, sentiment, etc.

**Response:**

```json
{
  "storyId": "story123",
  "sentiment": "positive",
  "themes": ["adventure", "friendship"],
  "readabilityScore": 8.5,
  "wordCount": 1500,
  "analyzedAt": "2024-01-01T00:00:00Z"
}
```

### NFT API (`/api/v1/nft`)

#### GET `/api/v1/nft`

Get NFT marketplace listings.

#### POST `/api/v1/nft/mint`

Mint a new NFT from story content.

**Request Body:**

```json
{
  "storyId": "story123",
  "metadata": {
    "name": "Story NFT",
    "description": "AI-generated story NFT",
    "image": "ipfs://..."
  },
  "price": "0.1"
}
```

### AI API (`/api/v1/ai`)

#### POST `/api/v1/ai/generate`

Generate content using AI models.

**Request Body:**

```json
{
  "prompt": "Generate a story about...",
  "model": "llama-3-70b",
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

#### POST `/api/v1/ai/analyze`

Analyze content with AI.

**Request Body:**

```json
{
  "content": "Content to analyze...",
  "analysisType": "sentiment"
}
```

### Users API (`/api/v1/users`)

#### GET `/api/v1/users/profile`

Get user profile information.

#### PUT `/api/v1/users/profile`

Update user profile.

## SDK Endpoints (`/sdk/v1`)

The SDK provides developer-friendly endpoints for external integrations:

- `/sdk/v1/health` - SDK health check
- `/sdk/v1/docs` - SDK documentation
- All story, AI, and NFT endpoints available under SDK namespace

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "status": 400
}
```

## Rate Limiting

- **Rate Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## CORS

CORS is configured to allow requests from:

- `https://groqtales.xyz` (production)
- `http://localhost:3000` (development)

## Health Checks

- **Backend API**: `GET /api/health`
- **SDK Service**: `GET /sdk/health`

## Deployment

The backend is deployed on Render with automatic scaling and health monitoring. See `render.yaml`
for configuration details.

## Environment Variables

Required environment variables:

```bash
NODE_ENV=production
PORT=3001
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-key
MONGODB_URI=your-mongodb-connection
REDIS_URL=your-redis-connection
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://groqtales.xyz
```

## Support

For API support and questions:

- GitHub Issues: [GroqTales Repository](https://github.com/Drago-03/GroqTales)
- Documentation: [docs.groqtales.com](https://docs.groqtales.com)
