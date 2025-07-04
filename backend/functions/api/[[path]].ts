import { createServer } from 'http';
import app from '../../dist/index.js';

// Cloudflare Pages Functions handler
export async function onRequest(context: any) {
  const { request, env } = context;
  
  // Set environment variables from Cloudflare
  process.env.DATABASE_URL = env.DATABASE_URL;
  process.env.JWT_SECRET = env.JWT_SECRET;
  process.env.NODE_ENV = 'production';
  process.env.FRONTEND_URL = 'https://app.ormi.com';

  return new Promise((resolve, reject) => {
    const server = createServer(app);
    
    // Convert Cloudflare request to Node.js request format
    const url = new URL(request.url);
    const pathname = url.pathname.replace('/api', '');
    
    // Create a mock Node.js request object
    const req = {
      method: request.method,
      url: pathname + url.search,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
    };

    // Create a mock Node.js response object
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      writeHead(status: number, headers?: any) {
        this.statusCode = status;
        if (headers) {
          Object.assign(this.headers, headers);
        }
      },
      write(chunk: string) {
        this.body += chunk;
      },
      end(chunk?: string) {
        if (chunk) this.body += chunk;
        
        resolve(new Response(this.body, {
          status: this.statusCode,
          headers: this.headers,
        }));
      },
    };

    try {
      app(req as any, res as any);
    } catch (error) {
      reject(new Response('Internal Server Error', { status: 500 }));
    }
  });
} 