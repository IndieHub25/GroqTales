import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const marketplace = new Hono<{ Bindings: Bindings }>();

marketplace.get('/listings', async (c) => {
    const db = c.env.DB;

    try {
        const { results } = await db.prepare(
            'SELECT m.*, s.title, s.cover_image_url, p.username as seller_name FROM marketplace_listings m JOIN stories s ON m.story_id = s.id JOIN profiles p ON m.seller_id = p.id WHERE m.status = ? AND s.review_status = ? ORDER BY m.created_at DESC LIMIT 50'
        ).bind('active', 'verified').all();

        return c.json({ listings: results });
    } catch (error) {
        return c.json({ error: 'Database error fetching listings' }, 500);
    }
});

marketplace.post('/list', async (c) => {
    const db = c.env.DB;
    try {
        const body = await c.req.json();
        const { id, story_id, seller_id, price, currency } = body;

        await db.prepare(
            'INSERT INTO marketplace_listings (id, story_id, seller_id, price, currency) VALUES (?, ?, ?, ?, ?)'
        )
            .bind(id, story_id, seller_id, price, currency || 'MON')
            .run();

        return c.json({ success: true, message: 'Listing created' }, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create listing' }, 500);
    }
});

export default marketplace;
