import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
    KV: KVNamespace;
};

const rag = new Hono<{ Bindings: Bindings }>();

// Dummy Vector Search implementation that uses KV for simplified embeddings cache
rag.post('/query', async (c) => {
    try {
        const body = await c.req.json();
        const { query } = body;

        if (!query) return c.json({ error: 'Query is required' }, 400);

        // Look up cached response in KV first (simulate RAG cache)
        const cacheKey = `rag-query:${query.trim().toLowerCase()}`;
        const cachedResponse = await c.env.KV.get(cacheKey);

        if (cachedResponse) {
            return c.json({ answer: cachedResponse, source: 'cache' });
        }

        // In a real RAG system, you'd embed the query, search Vector DB (or standard D1 FULLTEXT search)
        // and pass the context to an LLM like Groq.

        const db = c.env.DB;
        // VERY simple SQL LIKE search acting as poor-man's retrieval
        const { results } = await db.prepare(
            'SELECT title, content FROM stories WHERE content LIKE ? OR title LIKE ? LIMIT 5'
        )
            .bind(`%${query}%`, `%${query}%`)
            .all();

        let context = results.map(r => `Title: ${r.title}\nContent: ${r.content}`).join('\n\n');
        let answer = `Based on the stories in the system, here is what I found related to "${query}":\n\n${context || 'No relevant stories found.'}`;

        // Cache the "LLM" response in KV format for 1 hour
        await c.env.KV.put(cacheKey, answer, { expirationTtl: 3600 });

        return c.json({ answer, source: 'database' });
    } catch (error) {
        return c.json({ error: 'RAG Pipeline failed' }, 500);
    }
});

export default rag;
