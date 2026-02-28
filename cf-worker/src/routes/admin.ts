import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const admin = new Hono<{ Bindings: Bindings }>();

// Pseudo-middleware for admin check (in real app, use JWT / Auth headers)
admin.use('*', async (c, next) => {
    const adminId = c.req.header('x-admin-id');
    if (!adminId) return c.json({ error: 'Unauthorized: Missing Admin ID' }, 401);

    const db = c.env.DB;
    const profile = await db.prepare('SELECT role FROM profiles WHERE id = ?').bind(adminId).first();

    if (!profile || profile.role !== 'admin') {
        return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    await next();
});

// List all stories currently under review
admin.get('/pending', async (c) => {
    const db = c.env.DB;

    try {
        const { results } = await db.prepare(
            'SELECT s.id, s.title, s.content, s.ml_quality_score, p.username as author FROM stories s JOIN profiles p ON s.author_id = p.id WHERE s.review_status = ? ORDER BY s.created_at ASC'
        ).bind('under_review').all();

        return c.json({ pending_stories: results });
    } catch (error) {
        return c.json({ error: 'Database error fetching pending stories' }, 500);
    }
});

// Approve a story
admin.put('/approve/:id', async (c) => {
    const id = c.req.param('id');
    const db = c.env.DB;

    try {
        await db.prepare('UPDATE stories SET review_status = ? WHERE id = ?')
            .bind('verified', id)
            .run();

        return c.json({ success: true, message: 'Story officially verified and live on marketplace' });
    } catch (error) {
        return c.json({ error: 'Failed to approve story' }, 500);
    }
});

// Reject a story
admin.put('/reject/:id', async (c) => {
    const id = c.req.param('id');
    const db = c.env.DB;

    try {
        await db.prepare('UPDATE stories SET review_status = ? WHERE id = ?')
            .bind('rejected', id)
            .run();

        return c.json({ success: true, message: 'Story rejected' });
    } catch (error) {
        return c.json({ error: 'Failed to reject story' }, 500);
    }
});

export default admin;
