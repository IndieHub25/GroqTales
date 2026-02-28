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

// Example KV route
app.post('/api/kv/test', async (c) => {
    const { key, value } = await c.req.json();
    await c.env.KV.put(key, value);
    return c.json({ success: true, key, value });
});

app.get('/api/kv/test/:key', async (c) => {
    const key = c.req.param('key');
    const value = await c.env.KV.get(key);
    return c.json({ key, value });
});

export default app;
