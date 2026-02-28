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
    // 1. Authorize: only authenticated users can create listings
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
    }
    const token = authHeader.split(' ')[1];

    // In production, this would be a verified JWT subject.
    const seller_id = token;

    if (!seller_id) {
        return c.json({ error: 'Unauthorized: Invalid session' }, 401);
    }

    const db = c.env.DB;
    try {
        const body = await c.req.json();
        const { story_id, price, currency } = body;

        // 2. Validate required payload
        if (!story_id || typeof story_id !== 'string') {
            return c.json({ error: 'Invalid or missing story_id' }, 400);
        }

        // Validate price (must be positive number)
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            return c.json({ error: 'Invalid price: must be a positive number' }, 400);
        }

        // Validate currency (whitelist)
        const allowedCurrencies = ['MON', 'ETH'];
        const listCurrency = currency && allowedCurrencies.includes(currency.toUpperCase())
            ? currency.toUpperCase()
            : 'MON';

        // 3. Generate ID Server-Side (Never trust client IDs for new marketplace listings)
        const listingId = crypto.randomUUID();

        await db.prepare(
            'INSERT INTO marketplace_listings (id, story_id, seller_id, price, currency) VALUES (?, ?, ?, ?, ?)'
        )
            .bind(listingId, story_id, seller_id, numPrice.toString(), listCurrency)
            .run();

        return c.json({ success: true, message: 'Listing created', listingId }, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create listing or invalid payload format' }, 500);
    }
});

export default marketplace;
