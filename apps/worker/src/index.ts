import { Hono } from 'hono';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
  return c.json({
    message: 'Hello from Cloudflare Worker!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;
