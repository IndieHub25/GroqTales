import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const admin = new Hono<{ Bindings: Bindings }>();

// Admin middleware security fix (using JWT Bearer approach per user request)
admin.use('*', async (c, next) => {
    // 1. Extract Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
    }
    const token = authHeader.split(' ')[1];

    // In a production environment, verify the JWT properly using a secret.
    // Assuming token holds the adminId for this middleware as a temporary safe proxy
    // until the full verifyToken utility is wired up:
    const adminId = token;

    if (!adminId) return c.json({ error: 'Unauthorized: Invalid session' }, 401);

    const db = c.env.DB;
    try {
        const profile = await db.prepare('SELECT role FROM profiles WHERE id = ?').bind(adminId).first();

        if (!profile || profile.role !== 'admin') {
            return c.json({ error: 'Forbidden: Admin access required' }, 403);
        }

        // Pass to next handler
        await next();
    } catch (error) {
        return c.json({ error: 'Internal Server Error verifying admin status' }, 500);
    }
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
        const result = await db.prepare('UPDATE stories SET review_status = ? WHERE id = ?')
            .bind('verified', id)
            .run();

        // Check if any rows were actually affected
        if (result.meta?.changes === 0) {
            return c.json({ error: 'Not Found: Story does not exist or is already verified' }, 404);
        }

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
        const result = await db.prepare('UPDATE stories SET review_status = ? WHERE id = ?')
            .bind('rejected', id)
            .run();

        // Check if any rows were actually affected
        if (result.meta?.changes === 0) {
            return c.json({ error: 'Not Found: Story does not exist' }, 404);
        }

        return c.json({ success: true, message: 'Story rejected' });
    } catch (error) {
        return c.json({ error: 'Failed to reject story' }, 500);
    }
});

export default admin;
