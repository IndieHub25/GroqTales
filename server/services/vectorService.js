const axios = require('axios');
const StoryEmbedding = require('../models/StoryEmbedding');
const crypto = require('crypto');

class VectorService {
    constructor() {
        this.openAiKey = process.env.OPENAI_API_KEY;
    }

    // Generates embedding for text
    async getEmbedding(text) {
        if (!this.openAiKey) {
            console.warn('[VectorService] OPENAI_API_KEY not found. Using deterministic hash-based fallback embedding. For true semantic search, please provide an OPENAI_API_KEY.');
            return this._generateFallbackEmbedding(text);
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/embeddings',
                {
                    model: 'text-embedding-3-small',
                    input: text,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openAiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data.data[0].embedding;
        } catch (error) {
            console.error('[VectorService] Error generating embedding:', error.response?.data || error.message);
            return this._generateFallbackEmbedding(text);
        }
    }

    // Fallback 1536-dimensional vector based on simple text hashing
    _generateFallbackEmbedding(text) {
        const hash = crypto.createHash('sha256').update(text || '').digest();
        const vec = new Array(1536).fill(0);
        for (let i = 0; i < hash.length; i++) {
            for (let j = 0; j < 48; j++) {
                vec[i * 48 + j] = (hash[i] / 255.0) * Math.sin(j + i);
            }
        }
        // Normalize
        const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
        return vec.map(v => v / (mag || 1));
    }

    /**
     * Searches for similar storylines using MongoDB Atlas Vector Search
     */
    async searchSimilarStories(embedding, limit = 3) {
        try {
            const results = await StoryEmbedding.aggregate([
                {
                    $vectorSearch: {
                        index: 'storyline_vector_index',
                        path: 'embedding',
                        queryVector: embedding,
                        numCandidates: parseInt(limit) * 10,
                        limit: parseInt(limit),
                    }
                },
                {
                    $project: {
                        _id: 0,
                        storyline: 1,
                        genre: 1,
                        themes: 1,
                        score: { $meta: 'vectorSearchScore' }
                    }
                }
            ]);

            return results;
        } catch (error) {
            console.error('[VectorService] Error executing vector search:', error.message);
            return [];
        }
    }

    async storeStoryEmbedding(storyline, genre, themes) {
        try {
            const embedding = await this.getEmbedding(storyline);
            const doc = new StoryEmbedding({
                storyline,
                embedding,
                genre,
                themes
            });
            await doc.save();
            return doc;
        } catch (error) {
            console.error('[VectorService] Error storing story embedding:', error.message);
            return null;
        }
    }

    async checkStorylineExists(storyline, threshold = 0.85) {
        const embedding = await this.getEmbedding(storyline);
        const similar = await this.searchSimilarStories(embedding, 3);

        if (similar.length > 0 && similar[0].score >= threshold) {
            return {
                exists: true,
                similarStories: similar
            };
        }
        return { exists: false, similarStories: [] };
    }
}

module.exports = new VectorService();
