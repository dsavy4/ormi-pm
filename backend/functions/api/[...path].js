// Cloudflare Pages Functions wrapper for Express app
import app from '../dist/index.js';

export async function onRequest(context) {
  return app(context.request, context.env, context);
} 