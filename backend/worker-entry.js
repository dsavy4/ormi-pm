// worker-entry.js - Special entry point for Cloudflare Workers with globals setup

// Set up process global before any imports
globalThis.process = {
  env: {},
  version: 'cloudflare-worker-polyfill',
  exit: (code) => { console.error('process.exit called with code', code); },
  nextTick: (fn) => setTimeout(fn, 0),
  stdout: { write: console.log },
  stderr: { write: console.error }
};

// Now import the actual app
import app from './dist/worker-server.js';

// Export the app for Cloudflare Workers
export default {
  // Handle fetch requests
  async fetch(request, env, ctx) {
    // Copy env variables to our process.env
    Object.assign(globalThis.process.env, env);
    // Call the app's fetch handler with the environment
    return app.fetch(request, env, ctx);
  }
}; 