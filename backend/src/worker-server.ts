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

// ===== COMPREHENSIVE API ENDPOINTS =====

// 1. PROPERTY MANAGEMENT ENDPOINTS
app.post('/api/properties', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE PROPERTY ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        description: body.description,
        notes: body.notes,
        ownerId: user.userId,
        managerId: body.managerId || null,
      })
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Property creation error:', error);
      return c.json({ error: 'Failed to create property', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== PROPERTY CREATED SUCCESSFULLY =====');
    return c.json({ success: true, data: property });
  } catch (error) {
    console.error('[DEBUG] ===== PROPERTY CREATION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/properties/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPDATE PROPERTY ENDPOINT CALLED =====');
  try {
    const propertyId = c.req.param('id');
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: property, error } = await supabase
      .from('properties')
      .update({
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        description: body.description,
        notes: body.notes,
        managerId: body.managerId || null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', propertyId)
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Property update error:', error);
      return c.json({ error: 'Failed to update property', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== PROPERTY UPDATED SUCCESSFULLY =====');
    return c.json({ success: true, data: property });
  } catch (error) {
    console.error('[DEBUG] ===== PROPERTY UPDATE ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/properties/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DELETE PROPERTY ENDPOINT CALLED =====');
  try {
    const propertyId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    if (error) {
      console.log('[DEBUG] Property deletion error:', error);
      return c.json({ error: 'Failed to delete property', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== PROPERTY DELETED SUCCESSFULLY =====');
    return c.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('[DEBUG] ===== PROPERTY DELETION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 2. UNIT MANAGEMENT ENDPOINTS
app.post('/api/units', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE UNIT ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: unit, error } = await supabase
      .from('units')
      .insert({
        unitNumber: body.unitNumber,
        monthlyRent: body.monthlyRent,
        securityDeposit: body.securityDeposit,
        leaseStatus: body.leaseStatus || 'VACANT',
        leaseStart: body.leaseStart || null,
        leaseEnd: body.leaseEnd || null,
        notes: body.notes,
        propertyId: body.propertyId,
        tenantId: body.tenantId || null,
      })
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Unit creation error:', error);
      return c.json({ error: 'Failed to create unit', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== UNIT CREATED SUCCESSFULLY =====');
    return c.json({ success: true, data: unit });
  } catch (error) {
    console.error('[DEBUG] ===== UNIT CREATION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/units/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPDATE UNIT ENDPOINT CALLED =====');
  try {
    const unitId = c.req.param('id');
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: unit, error } = await supabase
      .from('units')
      .update({
        unitNumber: body.unitNumber,
        monthlyRent: body.monthlyRent,
        securityDeposit: body.securityDeposit,
        leaseStatus: body.leaseStatus,
        leaseStart: body.leaseStart || null,
        leaseEnd: body.leaseEnd || null,
        notes: body.notes,
        tenantId: body.tenantId || null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', unitId)
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Unit update error:', error);
      return c.json({ error: 'Failed to update unit', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== UNIT UPDATED SUCCESSFULLY =====');
    return c.json({ success: true, data: unit });
  } catch (error) {
    console.error('[DEBUG] ===== UNIT UPDATE ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/units/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DELETE UNIT ENDPOINT CALLED =====');
  try {
    const unitId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', unitId);
    
    if (error) {
      console.log('[DEBUG] Unit deletion error:', error);
      return c.json({ error: 'Failed to delete unit', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== UNIT DELETED SUCCESSFULLY =====');
    return c.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('[DEBUG] ===== UNIT DELETION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 3. TENANT MANAGEMENT ENDPOINTS
app.post('/api/tenants', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE TENANT ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: tenant, error } = await supabase
      .from('users')
      .insert({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        password: body.password || 'defaultpassword123', // In production, generate secure password
        role: 'TENANT',
        isActive: true,
        emailVerified: false,
      })
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Tenant creation error:', error);
      return c.json({ error: 'Failed to create tenant', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== TENANT CREATED SUCCESSFULLY =====');
    return c.json({ success: true, data: tenant });
  } catch (error) {
    console.error('[DEBUG] ===== TENANT CREATION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/tenants/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPDATE TENANT ENDPOINT CALLED =====');
  try {
    const tenantId = c.req.param('id');
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: tenant, error } = await supabase
      .from('users')
      .update({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', tenantId)
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Tenant update error:', error);
      return c.json({ error: 'Failed to update tenant', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== TENANT UPDATED SUCCESSFULLY =====');
    return c.json({ success: true, data: tenant });
  } catch (error) {
    console.error('[DEBUG] ===== TENANT UPDATE ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/tenants/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DELETE TENANT ENDPOINT CALLED =====');
  try {
    const tenantId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', tenantId)
      .eq('role', 'TENANT');
    
    if (error) {
      console.log('[DEBUG] Tenant deletion error:', error);
      return c.json({ error: 'Failed to delete tenant', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== TENANT DELETED SUCCESSFULLY =====');
    return c.json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('[DEBUG] ===== TENANT DELETION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 4. PAYMENT MANAGEMENT ENDPOINTS
app.post('/api/payments', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE PAYMENT ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        amount: body.amount,
        paymentDate: body.paymentDate || new Date().toISOString(),
        dueDate: body.dueDate,
        status: body.status || 'PENDING',
        method: body.method || 'MANUAL',
        notes: body.notes,
        unitId: body.unitId,
        tenantId: body.tenantId,
      })
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Payment creation error:', error);
      return c.json({ error: 'Failed to create payment', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== PAYMENT CREATED SUCCESSFULLY =====');
    return c.json({ success: true, data: payment });
  } catch (error) {
    console.error('[DEBUG] ===== PAYMENT CREATION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/payments/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPDATE PAYMENT ENDPOINT CALLED =====');
  try {
    const paymentId = c.req.param('id');
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        amount: body.amount,
        paymentDate: body.paymentDate,
        dueDate: body.dueDate,
        status: body.status,
        method: body.method,
        notes: body.notes,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Payment update error:', error);
      return c.json({ error: 'Failed to update payment', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== PAYMENT UPDATED SUCCESSFULLY =====');
    return c.json({ success: true, data: payment });
  } catch (error) {
    console.error('[DEBUG] ===== PAYMENT UPDATE ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/payments/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DELETE PAYMENT ENDPOINT CALLED =====');
  try {
    const paymentId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);
    
    if (error) {
      console.log('[DEBUG] Payment deletion error:', error);
      return c.json({ error: 'Failed to delete payment', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== PAYMENT DELETED SUCCESSFULLY =====');
    return c.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('[DEBUG] ===== PAYMENT DELETION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 5. MAINTENANCE REQUEST ENDPOINTS
app.post('/api/maintenance', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE MAINTENANCE REQUEST ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: maintenance, error } = await supabase
      .from('maintenance_requests')
      .insert({
        title: body.title,
        description: body.description,
        priority: body.priority || 'MEDIUM',
        status: body.status || 'SUBMITTED',
        unitId: body.unitId,
        tenantId: body.tenantId,
        assignedTo: body.assignedTo || null,
        notes: body.notes,
      })
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Maintenance creation error:', error);
      return c.json({ error: 'Failed to create maintenance request', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== MAINTENANCE REQUEST CREATED SUCCESSFULLY =====');
    return c.json({ success: true, data: maintenance });
  } catch (error) {
    console.error('[DEBUG] ===== MAINTENANCE CREATION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/maintenance', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET MAINTENANCE REQUESTS ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data: maintenance, error } = await supabase
      .from('maintenance_requests')
      .select('*');
    
    if (error) {
      console.log('[DEBUG] Maintenance query error:', error);
      return c.json({ error: 'Failed to fetch maintenance requests', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== MAINTENANCE REQUESTS FETCHED SUCCESSFULLY =====');
    return c.json({ success: true, data: maintenance || [] });
  } catch (error) {
    console.error('[DEBUG] ===== MAINTENANCE FETCH ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 6. MANAGER MANAGEMENT ENDPOINTS
app.get('/api/managers', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET MANAGERS ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data: managers, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['MANAGER', 'ADMIN']);
    
    if (error) {
      console.log('[DEBUG] Managers query error:', error);
      return c.json({ error: 'Failed to fetch managers', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== MANAGERS FETCHED SUCCESSFULLY =====');
    return c.json({ success: true, data: managers || [] });
  } catch (error) {
    console.error('[DEBUG] ===== MANAGERS FETCH ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/managers', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE MANAGER ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: manager, error } = await supabase
      .from('users')
      .insert({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        password: body.password || 'defaultpassword123',
        role: body.role || 'MANAGER',
        isActive: true,
        emailVerified: false,
      })
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Manager creation error:', error);
      return c.json({ error: 'Failed to create manager', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== MANAGER CREATED SUCCESSFULLY =====');
    return c.json({ success: true, data: manager });
  } catch (error) {
    console.error('[DEBUG] ===== MANAGER CREATION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 7. ANALYTICS ENDPOINTS
app.get('/api/analytics/overview', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET ANALYTICS OVERVIEW ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    
    // Get counts
    const { data: properties } = await supabase.from('properties').select('id');
    const { data: units } = await supabase.from('units').select('id');
    const { data: tenants } = await supabase.from('users').select('id').eq('role', 'TENANT');
    const { data: payments } = await supabase.from('payments').select('id, amount, status');
    const { data: maintenance } = await supabase.from('maintenance_requests').select('id, status, priority');
    
    // Calculate metrics
    const totalProperties = properties?.length || 0;
    const totalUnits = units?.length || 0;
    const totalTenants = tenants?.length || 0;
    const totalPayments = payments?.length || 0;
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const paidPayments = payments?.filter(p => p.status === 'PAID').length || 0;
    const pendingPayments = payments?.filter(p => p.status === 'PENDING').length || 0;
    const urgentMaintenance = maintenance?.filter(m => m.priority === 'HIGH' && m.status !== 'COMPLETED').length || 0;
    
    const analytics = {
      totalProperties,
      totalUnits,
      totalTenants,
      totalPayments,
      totalRevenue,
      paidPayments,
      pendingPayments,
      urgentMaintenance,
      occupancyRate: totalUnits > 0 ? ((totalUnits - (units?.filter((u: any) => u.leaseStatus === 'VACANT').length || 0)) / totalUnits) * 100 : 0,
      collectionRate: totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0,
    };
    
    console.log('[DEBUG] ===== ANALYTICS OVERVIEW FETCHED SUCCESSFULLY =====');
    return c.json({ success: true, data: analytics });
  } catch (error) {
    console.error('[DEBUG] ===== ANALYTICS OVERVIEW ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 8. FILE UPLOAD ENDPOINTS (Cloudflare R2)
app.post('/api/upload/image', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPLOAD IMAGE ENDPOINT CALLED =====');
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // For now, return a mock URL - in production, upload to Cloudflare R2
    const mockUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=800`;
    
    console.log('[DEBUG] ===== IMAGE UPLOAD SUCCESSFUL =====');
    return c.json({ 
      success: true, 
      data: { 
        url: mockUrl,
        filename: file.name,
        size: file.size,
        type: file.type
      } 
    });
  } catch (error) {
    console.error('[DEBUG] ===== IMAGE UPLOAD ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/upload/document', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPLOAD DOCUMENT ENDPOINT CALLED =====');
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // For now, return a mock URL - in production, upload to Cloudflare R2
    const mockUrl = `https://docs.example.com/document-${Math.random().toString(36).substring(7)}.pdf`;
    
    console.log('[DEBUG] ===== DOCUMENT UPLOAD SUCCESSFUL =====');
    return c.json({ 
      success: true, 
      data: { 
        url: mockUrl,
        filename: file.name,
        size: file.size,
        type: file.type
      } 
    });
  } catch (error) {
    console.error('[DEBUG] ===== DOCUMENT UPLOAD ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 9. SEARCH ENDPOINTS
app.get('/api/search', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== SEARCH ENDPOINT CALLED =====');
  try {
    const query = c.req.query('q');
    const type = c.req.query('type') || 'all';
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }
    
    const supabase = getSupabaseClient(c.env);
    const results: any = {};
    
    if (type === 'all' || type === 'properties') {
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .ilike('name', `%${query}%`);
      results.properties = properties || [];
    }
    
    if (type === 'all' || type === 'tenants') {
      const { data: tenants } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'TENANT')
        .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%`);
      results.tenants = tenants || [];
    }
    
    if (type === 'all' || type === 'units') {
      const { data: units } = await supabase
        .from('units')
        .select('*')
        .ilike('unitNumber', `%${query}%`);
      results.units = units || [];
    }
    
    console.log('[DEBUG] ===== SEARCH COMPLETED SUCCESSFULLY =====');
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('[DEBUG] ===== SEARCH ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 10. EXPORT ENDPOINTS
app.get('/api/export/properties', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== EXPORT PROPERTIES ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*');
    
    if (error) {
      return c.json({ error: 'Failed to fetch properties for export' }, 500);
    }
    
    // Convert to CSV format
    const csv = [
      ['ID', 'Name', 'Address', 'City', 'State', 'ZIP Code', 'Description', 'Created At'],
      ...(properties || []).map(p => [
        p.id,
        p.name,
        p.address,
        p.city,
        p.state,
        p.zipCode,
        p.description || '',
        new Date(p.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="properties.csv"'
      }
    });
  } catch (error) {
    console.error('[DEBUG] ===== EXPORT ERROR =====');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 11. BULK OPERATIONS
app.post('/api/bulk/delete-properties', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== BULK DELETE PROPERTIES ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids)) {
      return c.json({ error: 'Property IDs array is required' }, 400);
    }
    
    const supabase = getSupabaseClient(c.env);
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .in('id', ids);
    
    if (error) {
      return c.json({ error: 'Failed to delete properties', details: error.message }, 500);
    }
    
    return c.json({ success: true, message: `${ids.length} properties deleted successfully` });
  } catch (error) {
    console.error('[DEBUG] ===== BULK DELETE ERROR =====');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 12. NOTIFICATIONS ENDPOINTS
app.get('/api/notifications', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET NOTIFICATIONS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    
    // Mock notifications - in production, fetch from notifications table
    const notifications = [
      {
        id: '1',
        title: 'New maintenance request',
        message: 'Unit 101 has submitted a maintenance request',
        type: 'maintenance',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Payment received',
        message: 'Payment received for Unit 102',
        type: 'payment',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    return c.json({ success: true, data: notifications });
  } catch (error) {
    console.error('[DEBUG] ===== NOTIFICATIONS ERROR =====');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/notifications/:id/read', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== MARK NOTIFICATION READ ENDPOINT CALLED =====');
  try {
    const notificationId = c.req.param('id');
    
    // In production, update the notification in the database
    return c.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('[DEBUG] ===== MARK READ ERROR =====');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 13. SETTINGS ENDPOINTS
app.get('/api/settings', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET SETTINGS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    
    // Mock settings - in production, fetch from settings table
    const settings = {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD'
    };
    
    return c.json({ success: true, data: settings });
  } catch (error) {
    console.error('[DEBUG] ===== SETTINGS ERROR =====');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/settings', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPDATE SETTINGS ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    
    // In production, update settings in the database
    return c.json({ success: true, data: body, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('[DEBUG] ===== UPDATE SETTINGS ERROR =====');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 14. HEALTH CHECK ENDPOINT
app.get('/api/health', async (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: c.env.NODE_ENV || 'production'
  });
});

// 15. PING ENDPOINT FOR TESTING
app.get('/api/ping', async (c) => {
  return c.json({ 
    message: `pong-ormi-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
}); 