import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
    KV: KVNamespace;
    GEMINI_API_KEY: string;
    GROQ_API_KEY: string;
};

const stories = new Hono<{ Bindings: Bindings }>();

stories.get('/feed', async (c) => {
    const db = c.env.DB;

    // Try to get feed from KV cache first
    const cacheKey = 'global-feed';
    const cached = await c.env.KV.get(cacheKey);

    if (cached) {
        try {
            return c.json(JSON.parse(cached));
        } catch (parseError) {
            console.error('KV Cache Parse Error on global-feed', parseError);
            // Invalidate the corrupted cache immediately
            await c.env.KV.delete(cacheKey);
        }
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

    // 1. Extract Authorization header to get the authoritative Author ID safely
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
    }
    const token = authHeader.split(' ')[1];

    // In production, this would be a verified JWT subject.
    const author_id = token;

    if (!author_id) {
        return c.json({ error: 'Unauthorized: Invalid session' }, 401);
    }

    try {
        const body = await c.req.json();
        const { title, content, genre, tags, cover_image_url } = body;

        // Generate story ID server-side — never trust client-provided IDs
        const storyId = crypto.randomUUID();

        // Explicit payload validation before touching AI or DB
        if (!title || typeof title !== 'string') return c.json({ error: 'Invalid or missing title' }, 400);
        if (!content || typeof content !== 'string') return c.json({ error: 'Invalid or missing content' }, 400);
        if (tags !== undefined && !Array.isArray(tags)) return c.json({ error: 'Tags must be an array' }, 400);

        let seoKeywords = '';
        let seoDescription = '';
        let mlQualityScore = 5.0;

        try {
            const prompt = `Analyze the following story content and generate exactly 2 things separated by a pipe character (|): 1. A short 1 sentence SEO description. 2. A comma-separated list of 5 SEO keywords. Story text: "${content.substring(0, 1000)}"`;

            let aiText = '';

            // Try Gemini First (Chairman Model)
            if (c.env.GEMINI_API_KEY) {
                try {
                    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }]
                        })
                    });

                    if (geminiResponse.ok) {
                        const data: any = await geminiResponse.json();
                        aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    } else {
                        console.error('Gemini API Error:', await geminiResponse.text());
                    }
                } catch (geminiError) {
                    console.error('Gemini fetch failed', geminiError);
                }
            }

            // Fallback to Groq LLM if Gemini failed or missing key
            if (!aiText && c.env.GROQ_API_KEY) {
                try {
                    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${c.env.GROQ_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'llama3-8b-8192',
                            messages: [{ role: 'user', content: prompt }]
                        })
                    });

                    if (groqResponse.ok) {
                        const data: any = await groqResponse.json();
                        aiText = data?.choices?.[0]?.message?.content || '';
                    } else {
                        console.error('Groq API Error:', await groqResponse.text());
                    }
                } catch (groqError) {
                    console.error('Groq fetch failed', groqError);
                }
            }

            const parts = aiText.split('|');
            if (parts.length >= 2) {
                seoDescription = parts[0].trim().replace(/^"|"$/g, '');
                seoKeywords = parts[1].trim();
                mlQualityScore = 9.0;
            }
        } catch (aiError) {
            console.error('AI Generation pipeline failed', aiError);
        }

        await db.prepare(
            'INSERT INTO stories (id, author_id, title, content, genre, tags, cover_image_url, review_status, seo_keywords, seo_description, ml_quality_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
            .bind(
                storyId, author_id, title, content, genre || null,
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

        return c.json({ success: true, message: 'Story created', id: storyId }, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create story or invalid JSON payload' }, 500);
    }
});

stories.get('/:id', async (c) => {
    const id = c.req.param('id');
    const db = c.env.DB;

    try {
        // Enforce review_status filter to ensure draft/under_review stories cannot be viewed publicly
        const story = await db.prepare('SELECT * FROM stories WHERE id = ? AND review_status = ?')
            .bind(id, 'verified')
            .first();

        if (!story) {
            return c.json({ error: 'Story not found or not published' }, 404);
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
