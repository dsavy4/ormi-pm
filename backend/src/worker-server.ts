import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { timing } from 'hono/timing';
import { secureHeaders } from 'hono/secure-headers';
import { compress } from 'hono/compress';
import { etag } from 'hono/etag';
import { cache } from 'hono/cache';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import { getSupabaseClient } from './utils/supabase';

// Initialize Hono app
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Initialize Prisma
const prisma = new PrismaClient();

// Types
type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_ENDPOINT?: string;
  R2_PUBLIC_URL?: string;
};

type Variables = {
  user: {
    userId: string;
    email: string;
    role: string;
  };
};

// JWT helper functions
async function createJWT(payload: any, secret: string) {
  console.log('[DEBUG] Creating JWT with payload:', payload);
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(secret));
  console.log('[DEBUG] JWT created successfully');
  return jwt;
}

async function verifyJWT(token: string, secret: string) {
  console.log('[DEBUG] Verifying JWT token');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  console.log('[DEBUG] JWT verified, payload:', payload);
  return payload;
}

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', timing());
app.use('*', secureHeaders());
// app.use('*', compress()); // Temporarily disabled to fix binary response issue
app.use('*', etag());

// CORS - Updated to include app.ormi.com with better debugging
app.use('*', cors({
  origin: [
    'http://localhost:3000', 
    'https://54e00dfc.ormi.pages.dev', 
    'https://8bcc0d90.ormi.pages.dev',
    'https://afb69844.ormi.pages.dev',
    'https://74ad4bfd.ormi.pages.dev',
    'https://ormi.pages.dev',
    'https://app.ormi.com',
    'https://ormi.com'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
}));

// No cache middleware - handle caching manually per endpoint

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  console.log('[DEBUG] Auth middleware called');
  const authHeader = c.req.header('Authorization');
  console.log('[DEBUG] Auth header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[DEBUG] No valid auth header found');
    return c.json({ error: 'Authorization header is required' }, 401);
  }

  const token = authHeader.substring(7);
  console.log('[DEBUG] Token extracted:', token.substring(0, 20) + '...');
  const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET;
  console.log('[DEBUG] JWT secret available:', !!jwtSecret);
  
  if (!jwtSecret) {
    console.log('[DEBUG] JWT secret not configured');
    return c.json({ error: 'JWT secret not configured' }, 500);
  }

  try {
    const decoded = await verifyJWT(token, jwtSecret);
    console.log('[DEBUG] Token decoded successfully:', decoded);
    c.set('user', decoded);
    await next();
  } catch (error) {
    console.error('[DEBUG] Token verification failed:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Health check endpoint
app.get('/', (c) => {
  console.log('[DEBUG] Root endpoint called');
  return c.json({ 
    message: 'ORMI Property Management API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV || 'development'
  });
});

// Ping route for deployment verification
app.get('/api/ping', (c) => {
  console.log('[DEBUG] Ping endpoint called');
  return c.text('pong-ormi-database-auth-debug-' + Date.now());
});

// Auth routes (no auth required)
app.post('/api/auth/login', async (c) => {
  console.log('[DEBUG] ===== LOGIN ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    const { email, password } = body;
    console.log('[DEBUG] Login attempt for email:', email);
    console.log('[DEBUG] Password provided:', password ? 'YES' : 'NO');

    if (!email || !password) {
      console.log('[DEBUG] Missing email or password');
      return c.json({ error: 'Email and password are required' }, 400);
    }

    console.log('[DEBUG] Getting Supabase client...');
    const supabase = getSupabaseClient(c.env);
    console.log('[DEBUG] Supabase client created');
    
    console.log('[DEBUG] Querying database for user...');
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    console.log('[DEBUG] Database query result:');
    console.log('[DEBUG] - User found:', !!user);
    console.log('[DEBUG] - Error:', error);
    console.log('[DEBUG] - User data:', user ? { id: user.id, email: user.email, role: user.role } : 'null');

    if (error || !user) {
      console.log('[DEBUG] User not found in DB or error occurred');
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    console.log('[DEBUG] Checking password...');
    console.log('[DEBUG] - Provided password:', password);
    console.log('[DEBUG] - Stored password:', user.password);
    
    // Check password against database value
    const isValidPassword = password === user.password;
    console.log('[DEBUG] Password validation result:', isValidPassword);

    if (!isValidPassword) {
      console.log('[DEBUG] Invalid password - authentication failed');
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    console.log('[DEBUG] Password valid, generating JWT...');
    // Generate JWT
    const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET;
    console.log('[DEBUG] JWT secret available:', !!jwtSecret);
    
    if (!jwtSecret) {
      console.log('[DEBUG] JWT secret not configured');
      return c.json({ error: 'JWT secret not configured' }, 500);
    }

    const token = await createJWT(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret
    );

    console.log('[DEBUG] JWT created successfully');
    console.log('[DEBUG] ===== LOGIN SUCCESSFUL =====');
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    }, 200, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

  } catch (error) {
    console.error('[DEBUG] ===== LOGIN ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// User profile endpoint
app.get('/api/users/profile', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== PROFILE ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    console.log('[DEBUG] User from context:', user);
    
    console.log('[DEBUG] Getting Supabase client for profile...');
    const supabase = getSupabaseClient(c.env);
    
    console.log('[DEBUG] Querying database for user profile...');
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();
    
    console.log('[DEBUG] Profile query result:');
    console.log('[DEBUG] - User found:', !!dbUser);
    console.log('[DEBUG] - Error:', error);
    
    if (error || !dbUser) {
      console.log('[DEBUG] User not found in DB for profile');
      return c.json({ error: 'User not found' }, 404);
    }
    
    console.log('[DEBUG] ===== PROFILE SUCCESSFUL =====');
    return c.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        phoneNumber: dbUser.phoneNumber,
        avatar: dbUser.avatar
      }
    });
  } catch (error) {
    console.error('[DEBUG] ===== PROFILE ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Dashboard endpoint
app.get('/api/dashboard', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DASHBOARD ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    console.log('[DEBUG] User from context:', user);
    
    console.log('[DEBUG] Getting Supabase client for dashboard...');
    const supabase = getSupabaseClient(c.env);
    
    // Get properties count
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id');
    
    // Get units count
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('id');
    
    // Get tenants count (users with role TENANT)
    const { data: tenants, error: tenantsError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'TENANT');
    
    // Get payments count
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id');
    
    console.log('[DEBUG] Dashboard data query results:');
    console.log('[DEBUG] - Properties:', properties?.length || 0);
    console.log('[DEBUG] - Units:', units?.length || 0);
    console.log('[DEBUG] - Tenants:', tenants?.length || 0);
    console.log('[DEBUG] - Payments:', payments?.length || 0);
    
    const dashboardData = {
      totalProperties: properties?.length || 0,
      totalUnits: units?.length || 0,
      totalTenants: tenants?.length || 0,
      totalPayments: payments?.length || 0,
      monthlyIncome: 0, // Will be calculated from payments
      avgOccupancyRate: 0, // Will be calculated from units
      recentActivity: [],
      topPerformingProperty: null,
      lowPerformingProperties: [],
      urgentMaintenanceCount: 0,
      leasesExpiringThisMonth: 0
    };
    
    console.log('[DEBUG] ===== DASHBOARD SUCCESSFUL =====');
    return c.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('[DEBUG] ===== DASHBOARD ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Properties endpoint
app.get('/api/properties', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== PROPERTIES ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    console.log('[DEBUG] User from context:', user);
    
    console.log('[DEBUG] Getting Supabase client for properties...');
    const supabase = getSupabaseClient(c.env);
    console.log('[DEBUG] Supabase client created successfully');
    
    // Debug: Check what environment variables are available
    console.log('[DEBUG] Environment check:');
    console.log('[DEBUG] - SUPABASE_URL exists:', !!c.env.SUPABASE_URL);
    console.log('[DEBUG] - SUPABASE_ANON_KEY exists:', !!c.env.SUPABASE_ANON_KEY);
    console.log('[DEBUG] - DATABASE_URL exists:', !!c.env.DATABASE_URL);
    
    // First, let's test with a simple count query like the dashboard
    console.log('[DEBUG] Testing simple properties count query...');
    const { data: propertiesCount, error: countError } = await supabase
      .from('properties')
      .select('id');
    
    console.log('[DEBUG] Properties count result:');
    console.log('[DEBUG] - Count:', propertiesCount?.length || 0);
    console.log('[DEBUG] - Error:', countError);
    
    if (countError) {
      console.log('[DEBUG] Properties count error:', countError);
      return c.json({ error: 'Failed to fetch properties count', details: countError.message }, 500);
    }
    
    // If count works, try to get full data
    console.log('[DEBUG] Testing full properties query...');
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*');
    
    console.log('[DEBUG] Properties full query result:');
    console.log('[DEBUG] - Properties found:', properties?.length || 0);
    console.log('[DEBUG] - Error:', error);
    
    if (error) {
      console.log('[DEBUG] Properties full query error:', error);
      return c.json({ error: 'Failed to fetch properties', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== PROPERTIES SUCCESSFUL =====');
    return c.json({
      success: true,
      data: properties || [],
      pagination: {
        page: 1,
        limit: 20,
        total: properties?.length || 0,
        pages: Math.ceil((properties?.length || 0) / 20)
      }
    });
  } catch (error) {
    console.error('[DEBUG] ===== PROPERTIES ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Units endpoint
app.get('/api/units', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UNITS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    console.log('[DEBUG] User from context:', user);
    
    console.log('[DEBUG] Getting Supabase client for units...');
    const supabase = getSupabaseClient(c.env);
    
    const { data: units, error } = await supabase
      .from('units')
      .select('*');
    
    console.log('[DEBUG] Units query result:');
    console.log('[DEBUG] - Units found:', units?.length || 0);
    console.log('[DEBUG] - Error:', error);
    
    if (error) {
      console.log('[DEBUG] Units query error:', error);
      return c.json({ error: 'Failed to fetch units' }, 500);
    }
    
    console.log('[DEBUG] ===== UNITS SUCCESSFUL =====');
    return c.json({
      success: true,
      data: units || []
    });
  } catch (error) {
    console.error('[DEBUG] ===== UNITS ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Tenants endpoint
app.get('/api/tenants', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANTS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    console.log('[DEBUG] User from context:', user);
    
    console.log('[DEBUG] Getting Supabase client for tenants...');
    const supabase = getSupabaseClient(c.env);
    
    const { data: tenants, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'TENANT');
    
    console.log('[DEBUG] Tenants query result:');
    console.log('[DEBUG] - Tenants found:', tenants?.length || 0);
    console.log('[DEBUG] - Error:', error);
    
    if (error) {
      console.log('[DEBUG] Tenants query error:', error);
      return c.json({ error: 'Failed to fetch tenants' }, 500);
    }
    
    console.log('[DEBUG] ===== TENANTS SUCCESSFUL =====');
    return c.json({
      success: true,
      data: tenants || []
    });
  } catch (error) {
    console.error('[DEBUG] ===== TENANTS ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Payments endpoint
app.get('/api/payments', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== PAYMENTS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    console.log('[DEBUG] User from context:', user);
    
    console.log('[DEBUG] Getting Supabase client for payments...');
    const supabase = getSupabaseClient(c.env);
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*');
    
    console.log('[DEBUG] Payments query result:');
    console.log('[DEBUG] - Payments found:', payments?.length || 0);
    console.log('[DEBUG] - Error:', error);
    
    if (error) {
      console.log('[DEBUG] Payments query error:', error);
      return c.json({ error: 'Failed to fetch payments' }, 500);
    }
    
    console.log('[DEBUG] ===== PAYMENTS SUCCESSFUL =====');
    return c.json({
      success: true,
      data: payments || []
    });
  } catch (error) {
    console.error('[DEBUG] ===== PAYMENTS ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Export for Cloudflare Workers
export default app; 