import { Hono } from 'hono';

type Bindings = {
    DB: D1Database;
};

const profiles = new Hono<{ Bindings: Bindings }>();

profiles.get('/:id', async (c) => {
    const id = c.req.param('id');
    const db = c.env.DB;

    try {
        const profile = await db.prepare('SELECT * FROM profiles WHERE id = ?')
            .bind(id)
            .first();

        if (!profile) {
            return c.json({ error: 'Profile not found' }, 404);
        }

        return c.json({ profile });
    } catch (error) {
        return c.json({ error: 'Database error' }, 500);
    }
});

profiles.put('/:id', async (c) => {
    const id = c.req.param('id');
    const db = c.env.DB;

    try {
        const body = await c.req.json();
        const { username, bio, avatar_url } = body;

        // Check if exists
        const existing = await db.prepare('SELECT id FROM profiles WHERE id = ?').bind(id).first();

        if (existing) {
            await db.prepare('UPDATE profiles SET username = ?, bio = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .bind(username || null, bio || null, avatar_url || null, id)
                .run();
        } else {
            await db.prepare('INSERT INTO profiles (id, username, bio, avatar_url) VALUES (?, ?, ?, ?)')
                .bind(id, username || null, bio || null, avatar_url || null)
                .run();
        }

        return c.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        return c.json({ error: 'Invalid body or Database error' }, 500);
    }
});

export default profiles;
