import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
    KV: KVNamespace;
    AI: any;
};

const stories = new Hono<{ Bindings: Bindings }>();

stories.get('/feed', async (c) => {
    const db = c.env.DB;

    // Try to get feed from KV cache first
    const cacheKey = 'global-feed';
    const cached = await c.env.KV.get(cacheKey);
    if (cached) {
        return c.json(JSON.parse(cached));
    }

    try {
        const { results } = await db.prepare(
            'SELECT s.*, p.username as author_username, p.avatar_url as author_avatar FROM stories s JOIN profiles p ON s.author_id = p.id WHERE s.review_status = ? ORDER BY s.created_at DESC LIMIT 50'
        ).bind('verified').all();

        const response = { feed: results };

        // Cache for 60 seconds
        await c.env.KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 60 });

        return c.json(response);
    } catch (error) {
        return c.json({ error: 'Database error fetching feed' }, 500);
    }
});

stories.post('/', async (c) => {
    const db = c.env.DB;
    try {
        const body = await c.req.json();
        const { id, author_id, title, content, genre, tags, cover_image_url } = body;

        let seoKeywords = '';
        let seoDescription = '';
        let mlQualityScore = 5.0;

        try {
            const prompt = `Analyze the following story content and generate exactly 2 things separated by a pipe character (|): 1. A short 1 sentence SEO description. 2. A comma-separated list of 5 SEO keywords. Story text: "${content.substring(0, 1000)}"`;
            const aiResponse = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [{ role: 'user', content: prompt }]
            });
            const aiText = aiResponse.response || '';
            const parts = aiText.split('|');
            if (parts.length >= 2) {
                seoDescription = parts[0].trim();
                seoKeywords = parts[1].trim();
                mlQualityScore = 8.5;
            }
        } catch (aiError) {
            console.error('AI Generation failed', aiError);
        }

        await db.prepare(
            'INSERT INTO stories (id, author_id, title, content, genre, tags, cover_image_url, review_status, seo_keywords, seo_description, ml_quality_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
            .bind(
                id, author_id, title, content, genre || null,
                tags ? JSON.stringify(tags) : null,
                cover_image_url || null,
                'under_review',
                seoKeywords || null,
                seoDescription || null,
                mlQualityScore
            )
            .run();

        // Invalidate feed cache
        await c.env.KV.delete('global-feed');

        return c.json({ success: true, message: 'Story created' }, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create story' }, 500);
    }
});

stories.get('/:id', async (c) => {
    const id = c.req.param('id');
    const db = c.env.DB;

    try {
        const story = await db.prepare('SELECT * FROM stories WHERE id = ?')
            .bind(id)
            .first();

        if (!story) {
            return c.json({ error: 'Story not found' }, 404);
        }

        // Increment views asynchronously
        c.executionCtx.waitUntil(
            db.prepare('UPDATE stories SET views_count = views_count + 1 WHERE id = ?').bind(id).run()
        );

        return c.json({ story });
    } catch (error) {
        return c.json({ error: 'Database error' }, 500);
    }
});

export default stories;
