import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
    KV: KVNamespace;
};

const feeds = new Hono<{ Bindings: Bindings, Variables: { user: { id: string } } }>();

// Auth middleware for notifications
feeds.use('/notifications/*', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
    }
    const token = authHeader.split(' ')[1];
    const userId = token; // temporary simple decode

    if (!userId) return c.json({ error: 'Unauthorized: Invalid session' }, 401);

    c.set('user', { id: userId });
    await next();
});

/**
 * GET /api/feeds/trending?period=daily|weekly|alltime&limit=20
 * Returns top trending stories from D1.
 */
feeds.get('/trending', async (c) => {
    const period = c.req.query('period') || 'daily';
    let parsedLimit = parseInt(c.req.query('limit') || '20', 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 20;
    const limit = Math.min(parsedLimit, 50);

    try {
        const rows = await c.env.DB.prepare(`
            SELECT
                t.story_id,
                t.score,
                t.period,
                t.updated_at,
                s.title,
                s.content,
                s.genre,
                s.cover_image_url,
                s.likes_count,
                s.views_count,
                p.username AS author_username,
                p.avatar_url AS author_avatar
            FROM trending_stories t
            LEFT JOIN stories s ON t.story_id = s.id
            LEFT JOIN profiles p ON s.author_id = p.id
            WHERE t.period = ?
            ORDER BY t.score DESC
            LIMIT ?
        `)
            .bind(period, limit)
            .all();

        return c.json({
            success: true,
            data: rows.results || [],
            period,
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

/**
 * GET /api/feeds/notifications/:userId?unread=true&limit=30
 * Returns a user's notifications.
 */
feeds.get('/notifications/:userId', async (c) => {
    const requestedUserId = c.req.param('userId');
    const authUser = c.get('user');

    if (!authUser || authUser.id !== requestedUserId) {
        return c.json({ error: 'Forbidden: Cannot access other users notifications' }, 403);
    }

    const unreadOnly = c.req.query('unread') === 'true';
    let parsedLimit = parseInt(c.req.query('limit') || '30', 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 30;
    const limit = Math.min(parsedLimit, 50);

    try {
        let query = `
            SELECT * FROM notifications
            WHERE user_id = ?
        `;
        const bindings: any[] = [requestedUserId];

        if (unreadOnly) {
            query += ` AND read = 0`;
        }

        query += ` ORDER BY created_at DESC LIMIT ?`;
        bindings.push(limit);

        const rows = await c.env.DB.prepare(query).bind(...bindings).all();

        return c.json({
            success: true,
            data: rows.results || [],
            total: rows.results?.length || 0,
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

/**
 * POST /api/feeds/notifications/:id/read
 * Mark a single notification as read.
 */
feeds.post('/notifications/:id/read', async (c) => {
    const authUser = c.get('user');
    const id = c.req.param('id');

    if (!authUser) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const result = await c.env.DB.prepare(
            `UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`
        )
            .bind(id, authUser.id)
            .run();

        if (result.meta?.changes === 0) {
            return c.json({ error: 'Forbidden or not found' }, 403);
        }

        return c.json({ success: true });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

/**
 * POST /api/feeds/notifications/mark-all-read
 * Mark all of a user's notifications as read.
 */
feeds.post('/notifications/mark-all-read', async (c) => {
    const authUser = c.get('user');
    if (!authUser) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        await c.env.DB.prepare(`UPDATE notifications SET read = 1 WHERE user_id = ?`)
            .bind(authUser.id)
            .run();
        return c.json({ success: true });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

export default feeds;
