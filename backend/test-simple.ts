import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Hello World' });
});

app.post('/test', (c) => {
  return c.json({ message: 'Test route' });
});

export default app; 