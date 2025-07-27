import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Hello World' });
});

app.post('/auth/login', (c) => {
  return c.json({ message: 'Login route' });
});

export default app; 