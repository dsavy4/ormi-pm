import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a built-ins plugin to handle Node.js built-in modules
const buildInsPlugin = {
  name: 'node-builtins',
  setup(build) {
    // List of Node.js built-in modules to provide empty shims for
    const builtins = [
      'buffer', 'crypto', 'fs', 'path', 'os', 'stream', 'util', 'events',
      'zlib', 'http', 'https', 'net', 'tls', 'querystring', 'url', 'punycode',
      'string_decoder', 'dns', 'constants', 'assert', 'child_process'
    ];

    // Handle each built-in module
    builtins.forEach(mod => {
      build.onResolve({ filter: new RegExp(`^${mod}$`) }, args => {
        return {
          path: args.path,
          namespace: 'node-builtins'
        };
      });
    });

    // Provide empty implementations (or appropriate browser polyfills)
    build.onLoad({ filter: /.*/, namespace: 'node-builtins' }, args => {
      // Return specific polyfills for modules that need them
      if (args.path === 'path') {
        return {
          contents: `export default {}; export const join = () => ""; export const resolve = () => ""; export const dirname = () => "";`,
          loader: 'js'
        };
      }
      
      if (args.path === 'fs') {
        return {
          contents: `export default {}; export const readFileSync = () => ""; export const existsSync = () => true;`,
          loader: 'js'
        };
      }
      
      // Default empty implementation
      return {
        contents: `export default {}; export const ${args.path} = {};`,
        loader: 'js'
      };
    });
  }
};

// Run the build
esbuild.build({
  entryPoints: ['worker-entry.js'],
  bundle: true,
  outdir: 'dist',
  platform: 'browser',
  format: 'esm',
  sourcemap: true,
  target: ['es2020'],
  plugins: [
    buildInsPlugin,
    copy({
      assets: [
        {
          from: ['./prisma/schema.prisma'],
          to: ['./schema.prisma']
        }
      ]
    })
  ],
  banner: {
    js: `
      // This file contains polyfills and enhanced compatibility functions for Workers
      // Don't import Buffer in Cloudflare Workers, use a polyfill instead
      const Buffer = { isBuffer: () => false };
      globalThis.Buffer = Buffer;
      
      // Comprehensive process polyfill for Cloudflare Workers
      if (typeof globalThis.process === 'undefined') {
        globalThis.process = {
          env: {},
          version: 'cloudflare-worker-polyfill',
          exit: (code) => { console.error('process.exit called with code', code); },
          nextTick: (fn) => setTimeout(fn, 0)
        };
      }
    `
  },
  logLevel: 'info',
  metafile: true
}).catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
}); 