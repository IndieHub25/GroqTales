import { Hono } from 'hono';
import { cors } from 'hono/cors';

import profiles from './routes/profiles';
import stories from './routes/stories';
import marketplace from './routes/marketplace';
import rag from './routes/rag';
import admin from './routes/admin';

type Bindings = {
    DB: D1Database;
    KV: KVNamespace;
    ADMIN_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.route('/api/profiles', profiles);
app.route('/api/stories', stories);
app.route('/api/marketplace', marketplace);
app.route('/api/rag', rag);
app.route('/api/admin', admin);

app.get('/', (c) => {
    return c.json({
        status: 'online',
        message: 'Welcome to the GroqTales Cloudflare Worker Backend',
    });
});

app.get('/health', async (c) => {
    // Test D1 and KV
    let d1Status = 'ok';
    let kvStatus = 'ok';

    try {
        await c.env.DB.prepare('SELECT 1').first();
    } catch (e) {
        d1Status = 'failed';
    }

    try {
        await c.env.KV.get('health-check-key');
    } catch (e) {
        kvStatus = 'failed';
    }

    return c.json({
        status: d1Status === 'ok' && kvStatus === 'ok' ? 'ok' : 'degraded',
        d1: d1Status,
        kv: kvStatus,
        timestamp: new Date().toISOString()
    });
});

// Example KV route (Protected)
app.post('/api/kv/test', async (c) => {
    // Only allow admins to write to arbitrary KV keys (or block entirely in prod)
    const adminKey = c.req.header('x-admin-secret');
    if (!adminKey || adminKey !== c.env.ADMIN_SECRET) {
        return c.json({ error: 'Unauthorized KV access' }, 401);
    }

    try {
        const body = await c.req.json();
        const key = body?.key;
        const value = body?.value;

        if (!key || typeof key !== 'string' || key.length > 256) {
            return c.json({ error: 'Invalid or missing key' }, 400);
        }
        if (!value || typeof value !== 'string') {
            return c.json({ error: 'Invalid or missing value. Must be a string.' }, 400);
        }

        await c.env.KV.put(key, value);
        return c.json({ success: true, key });
    } catch (e) {
        return c.json({ error: 'Invalid JSON payload' }, 400);
    }
});

app.get('/api/kv/test/:key', async (c) => {
    // Only allow admins to read arbitrary KV keys
    const adminKey = c.req.header('x-admin-secret');
    if (!adminKey || adminKey !== c.env.ADMIN_SECRET) {
        return c.json({ error: 'Unauthorized KV access' }, 401);
    }

    const key = c.req.param('key');
    if (!key || typeof key !== 'string') {
        return c.json({ error: 'Invalid key' }, 400);
    }

    const value = await c.env.KV.get(key);
    if (value === null) {
        return c.json({ error: 'Key not found' }, 404);
    }
    return c.json({ key, value });
});

export default app;
