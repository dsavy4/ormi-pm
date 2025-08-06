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
import Stripe from 'stripe';

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
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
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
  console.log('[DEBUG] Environment variables check:', {
    hasR2PublicUrl: !!c.env.R2_PUBLIC_URL,
    r2PublicUrlValue: c.env.R2_PUBLIC_URL,
    hasJwtSecret: !!c.env.JWT_SECRET,
    hasDatabaseUrl: !!c.env.DATABASE_URL
  });
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

// Properties insights endpoint (MUST come before /:id route)
app.get('/api/properties/insights', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== PROPERTIES INSIGHTS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    console.log('[DEBUG] User from context:', user);
    
    console.log('[DEBUG] Getting Supabase client for properties insights...');
    const supabase = getSupabaseClient(c.env);
    
    // Get properties for insights
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*');
    
    if (propertiesError) {
      console.log('[DEBUG] Properties insights query error:', propertiesError);
      return c.json({ error: 'Failed to fetch properties for insights' }, 500);
    }
    
    // Calculate insights
    const totalProperties = properties?.length || 0;
    const totalUnits = properties?.reduce((sum, p) => sum + (p.totalUnits || 0), 0) || 0;
    const totalValue = properties?.reduce((sum, p) => sum + (p.estimatedValue || 0), 0) || 0;
    const avgOccupancy = properties?.reduce((sum, p) => sum + (p.occupancyRate || 0), 0) / totalProperties || 0;
    
    console.log('[DEBUG] ===== PROPERTIES INSIGHTS SUCCESSFUL =====');
    return c.json({
      success: true,
      data: {
        totalProperties,
        totalUnits,
        totalValue,
        avgOccupancy: Math.round(avgOccupancy * 100) / 100,
        occupancyTrend: 'up',
        revenueTrend: 'up',
        maintenanceTrend: 'down'
      }
    });
  } catch (error) {
    console.error('[DEBUG] ===== PROPERTIES INSIGHTS ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Get individual property by ID
app.get('/api/properties/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET PROPERTY BY ID ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const propertyId = c.req.param('id');
    
    console.log('[DEBUG] User ID:', user.userId);
    console.log('[DEBUG] Property ID:', propertyId);
    
    const supabase = getSupabaseClient(c.env);
    
    // Get property with related data
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        units:units(*),
        manager:users!properties_property_manager_id_fkey(
          id,
          firstName,
          lastName,
          email,
          avatar
        )
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) {
      console.error('[DEBUG] Property fetch error:', error);
      return c.json({ error: 'Property not found' }, 404);
    }
    
    if (!property) {
      console.error('[DEBUG] Property not found for ID:', propertyId);
      return c.json({ error: 'Property not found' }, 404);
    }
    
    console.log('[DEBUG] ===== PROPERTY FETCHED SUCCESSFULLY =====');
    return c.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('[DEBUG] ===== GET PROPERTY BY ID ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
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

// Unit image upload endpoints
app.post('/api/units/:id/images/upload-url', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UNIT IMAGE UPLOAD URL ENDPOINT CALLED =====');
  try {
    const unitId = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();
    const { fileName, fileType } = body;

    if (!fileName || !fileType) {
      return c.json({ error: 'fileName and fileType are required' }, 400);
    }

    // Verify unit exists and user has access
    const supabase = getSupabaseClient(c.env);
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select(`
        id,
        property:properties!units_property_id_fkey (
          id,
          owner_id
        )
      `)
      .eq('id', unitId)
      .single();

    if (unitError || !unit) {
      return c.json({ error: 'Unit not found' }, 404);
    }

    // Type assertion for the property relationship
    const unitWithProperty = unit as any;
    if (!unitWithProperty.property || unitWithProperty.property.owner_id !== user.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Import storage service
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(c.env);

    // Generate presigned URL
    const result = await storageService.generatePresignedUrl(fileName, fileType, `units/${unitId}/images`);

    return c.json({
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        fileName: result.key,
        publicUrl: result.publicUrl
      }
    });
  } catch (error) {
    console.error('[DEBUG] Unit image upload URL generation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/units/:id/images', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UNIT IMAGE UPLOAD ENDPOINT CALLED =====');
  try {
    const unitId = c.req.param('id');
    const user = c.get('user');

    // Verify unit exists and user has access
    const supabase = getSupabaseClient(c.env);
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select(`
        id,
        images,
        property:properties!units_property_id_fkey (
          id,
          owner_id
        )
      `)
      .eq('id', unitId)
      .single();

    if (unitError || !unit) {
      return c.json({ error: 'Unit not found' }, 404);
    }

    // Type assertion for the property relationship  
    const unitWithPropertyImg = unit as any;
    if (!unitWithPropertyImg.property || unitWithPropertyImg.property.owner_id !== user.userId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    const formData = await c.req.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return c.json({ error: 'No images provided' }, 400);
    }

    // Import storage service
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(c.env);
    const uploadedImages = [];

    for (const file of files) {
      if (file && file.size > 0) {
        // Upload to R2 with optimized account-based path
        const buffer = await file.arrayBuffer();
        const user = c.get('user');
        const filePath = `${user.userId}/property/${unitWithPropertyImg.propertyId}/${unitId}`;
        const uploadResult = await storageService.uploadFile(Buffer.from(buffer), file.name, file.type, filePath);

        uploadedImages.push(uploadResult.url);
        
        // Create document record for tracking
        const documentData = {
          fileName: file.name,
          fileUrl: uploadResult.url,
          fileType: file.type,
          fileSize: file.size,
          category: 'property',
          accountId: user.userId,
          uploadedBy: user.userId,
          propertyId: unitWithPropertyImg.propertyId,
          unitId: unitId,
          tags: ['unit', 'image', 'property'],
          description: `Unit image for unit ${unitId}`,
          isPublic: false,
          uploadedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await supabase.from('documents').insert(documentData);
      }
    }

    // Update unit with new images
    const existingImages = unitWithPropertyImg.images || [];
    const allImages = [...existingImages, ...uploadedImages];

    const { error: updateError } = await supabase
      .from('units')
      .update({ 
        images: allImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', unitId);

    if (updateError) {
      console.error('[DEBUG] Unit image update error:', updateError);
      return c.json({ error: 'Failed to update unit images' }, 500);
    }

    console.log('[DEBUG] ===== UNIT IMAGES UPLOADED SUCCESSFULLY =====');
    return c.json({
      success: true,
      data: {
        images: allImages,
        uploadedCount: uploadedImages.length
      }
    });
  } catch (error) {
    console.error('[DEBUG] Unit image upload error:', error);
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

// ===== R2 CLEANUP HELPER FUNCTIONS =====

/**
 * Clean up R2 files for a property and all its units
 */
async function cleanupPropertyFiles(env: any, userId: string, propertyId: string): Promise<void> {
  try {
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(env);
    
    // Get all files for this property from documents table
    const supabase = getSupabaseClient(env);
    const { data: documents, error } = await supabase
      .from('documents')
      .select('fileUrl')
      .eq('propertyId', propertyId);
    
    if (error) {
      console.error('[DEBUG] Error fetching property documents for cleanup:', error);
      return;
    }
    
    // Delete each file from R2
    for (const doc of documents || []) {
      if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
        try {
          await storageService.deleteFile(doc.fileUrl);
          console.log('[DEBUG] Deleted R2 file:', doc.fileUrl);
        } catch (deleteError) {
          console.error('[DEBUG] Error deleting R2 file:', doc.fileUrl, deleteError);
        }
      }
    }
    
    // Also delete any files in the property directory structure
    const propertyPath = `${userId}/property/${propertyId}`;
    try {
      // Note: This would require listing objects in R2, which we'll implement later
      console.log('[DEBUG] Property cleanup completed for path:', propertyPath);
    } catch (pathError) {
      console.error('[DEBUG] Error cleaning up property path:', propertyPath, pathError);
    }
  } catch (error) {
    console.error('[DEBUG] Property cleanup error:', error);
  }
}

/**
 * Clean up R2 files for a team member
 */
async function cleanupTeamMemberFiles(env: any, userId: string, teamMemberId: string): Promise<void> {
  try {
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(env);
    
    // Get all files for this team member from documents table
    const supabase = getSupabaseClient(env);
    const { data: documents, error } = await supabase
      .from('documents')
      .select('fileUrl')
      .eq('category', 'team')
      .eq('accountId', userId);
    
    if (error) {
      console.error('[DEBUG] Error fetching team documents for cleanup:', error);
      return;
    }
    
    // Delete each file from R2
    for (const doc of documents || []) {
      if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
        try {
          await storageService.deleteFile(doc.fileUrl);
          console.log('[DEBUG] Deleted R2 file:', doc.fileUrl);
        } catch (deleteError) {
          console.error('[DEBUG] Error deleting R2 file:', doc.fileUrl, deleteError);
        }
      }
    }
    
    // Also delete any files in the team member directory structure
    const teamPath = `${userId}/team/${teamMemberId}`;
    try {
      console.log('[DEBUG] Team member cleanup completed for path:', teamPath);
    } catch (pathError) {
      console.error('[DEBUG] Error cleaning up team member path:', teamPath, pathError);
    }
  } catch (error) {
    console.error('[DEBUG] Team member cleanup error:', error);
  }
}

/**
 * Clean up R2 files for a unit
 */
async function cleanupUnitFiles(env: any, userId: string, unitId: string, propertyId: string): Promise<void> {
  try {
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(env);
    
    // Get all files for this unit from documents table
    const supabase = getSupabaseClient(env);
    const { data: documents, error } = await supabase
      .from('documents')
      .select('fileUrl')
      .eq('unitId', unitId);
    
    if (error) {
      console.error('[DEBUG] Error fetching unit documents for cleanup:', error);
      return;
    }
    
    // Delete each file from R2
    for (const doc of documents || []) {
      if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
        try {
          await storageService.deleteFile(doc.fileUrl);
          console.log('[DEBUG] Deleted R2 file:', doc.fileUrl);
        } catch (deleteError) {
          console.error('[DEBUG] Error deleting R2 file:', doc.fileUrl, deleteError);
        }
      }
    }
    
    // Also delete any files in the unit directory structure
    const unitPath = `${userId}/property/${propertyId}/${unitId}`;
    try {
      console.log('[DEBUG] Unit cleanup completed for path:', unitPath);
    } catch (pathError) {
      console.error('[DEBUG] Error cleaning up unit path:', unitPath, pathError);
    }
  } catch (error) {
    console.error('[DEBUG] Unit cleanup error:', error);
  }
}

/**
 * Clean up R2 files for a tenant
 */
async function cleanupTenantFiles(env: any, userId: string, tenantId: string): Promise<void> {
  try {
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(env);
    
    // Get all files for this tenant from documents table
    const supabase = getSupabaseClient(env);
    const { data: documents, error } = await supabase
      .from('documents')
      .select('fileUrl')
      .eq('tenantId', tenantId);
    
    if (error) {
      console.error('[DEBUG] Error fetching tenant documents for cleanup:', error);
      return;
    }
    
    // Delete each file from R2
    for (const doc of documents || []) {
      if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
        try {
          await storageService.deleteFile(doc.fileUrl);
          console.log('[DEBUG] Deleted R2 file:', doc.fileUrl);
        } catch (deleteError) {
          console.error('[DEBUG] Error deleting R2 file:', doc.fileUrl, deleteError);
        }
      }
    }
    
    // Also delete any files in the tenant directory structure
    const tenantPath = `${userId}/tenants/${tenantId}`;
    try {
      console.log('[DEBUG] Tenant cleanup completed for path:', tenantPath);
    } catch (pathError) {
      console.error('[DEBUG] Error cleaning up tenant path:', tenantPath, pathError);
    }
  } catch (error) {
    console.error('[DEBUG] Tenant cleanup error:', error);
  }
}

/**
 * Clean up R2 files for a maintenance request
 */
async function cleanupMaintenanceRequestFiles(env: any, userId: string, maintenanceId: string): Promise<void> {
  try {
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(env);
    
    // Get the maintenance request to access its images
    const supabase = getSupabaseClient(env);
    const { data: maintenance, error: fetchError } = await supabase
      .from('maintenance_requests')
      .select('images')
      .eq('id', maintenanceId)
      .single();
    
    if (fetchError || !maintenance) {
      console.error('[DEBUG] Error fetching maintenance request for cleanup:', fetchError);
      return;
    }
    
    // Delete each image from R2
    for (const imageUrl of maintenance.images || []) {
      if (imageUrl && !imageUrl.startsWith('http')) {
        try {
          await storageService.deleteFile(imageUrl);
          console.log('[DEBUG] Deleted maintenance R2 file:', imageUrl);
        } catch (deleteError) {
          console.error('[DEBUG] Error deleting maintenance R2 file:', imageUrl, deleteError);
        }
      }
    }
    
    // Also get any documents associated with this maintenance request
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('fileUrl')
      .eq('category', 'maintenance')
      .eq('accountId', userId);
    
    if (!docError && documents) {
      for (const doc of documents) {
        if (doc.fileUrl && !doc.fileUrl.startsWith('http')) {
          try {
            await storageService.deleteFile(doc.fileUrl);
            console.log('[DEBUG] Deleted maintenance document R2 file:', doc.fileUrl);
          } catch (deleteError) {
            console.error('[DEBUG] Error deleting maintenance document R2 file:', doc.fileUrl, deleteError);
          }
        }
      }
    }
    
    console.log('[DEBUG] Maintenance request cleanup completed for ID:', maintenanceId);
  } catch (error) {
    console.error('[DEBUG] Maintenance request cleanup error:', error);
  }
}

/**
 * Clean up R2 files for a single document
 */
async function cleanupDocumentFile(env: any, fileUrl: string): Promise<void> {
  try {
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(env);
    
    if (fileUrl && !fileUrl.startsWith('http')) {
      await storageService.deleteFile(fileUrl);
      console.log('[DEBUG] Deleted document R2 file:', fileUrl);
    }
  } catch (error) {
    console.error('[DEBUG] Document cleanup error:', error);
  }
}

// ===== COMPREHENSIVE API ENDPOINTS =====

// 1. PROPERTY MANAGEMENT ENDPOINTS
app.post('/api/properties', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE PROPERTY ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    // Generate a unique ID
    const propertyId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        id: propertyId,
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        propertyType: body.propertyType || 'APARTMENT',
        totalUnits: body.totalUnits || 1,
        occupiedUnits: body.occupiedUnits || 0,
        monthlyRent: parseFloat(body.monthlyRent || 1000.00).toFixed(2),
        description: body.description,
        notes: body.notes,
        images: body.images || [], // These will be processed with account-based paths
        amenities: body.amenities || [],
        tags: body.tags || [],
        yearBuilt: body.yearBuilt,
        sqft: body.sqft,
        lotSize: body.lotSize,
        unitSuite: body.unitSuite,
        country: body.country || 'United States',
        ownershipType: body.ownershipType,
        rentDueDay: body.rentDueDay || 1,
        allowOnlinePayments: body.allowOnlinePayments || false,
        enableMaintenanceRequests: body.enableMaintenanceRequests || true,
        status: body.status || 'ACTIVE',
        isActive: body.isActive !== undefined ? body.isActive : true,
        ownerId: user.userId,
        propertyManagerId: body.propertyManager || body.managerId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
    
    console.log('[DEBUG] Received update data:', body);
    
    const supabase = getSupabaseClient(c.env);
    
    // Prepare update data with only fields that exist in the database
    const updateData = {
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      description: body.description,
      notes: body.notes,
      propertyType: body.propertyType,
      yearBuilt: body.yearBuilt,
      sqft: body.sqft,
      lotSize: body.lotSize,
      amenities: body.amenities,
      images: body.images,
      propertyManagerId: body.propertyManager || body.managerId || null,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('[DEBUG] Update data prepared:', updateData);
    
    const { data: property, error } = await supabase
      .from('properties')
      .update(updateData)
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
    const user = c.get('user');
    const propertyId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    // First, get the property to ensure it exists and get any related data
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();
    
    if (fetchError || !property) {
      console.log('[DEBUG] Property not found for deletion:', propertyId);
      return c.json({ error: 'Property not found' }, 404);
    }
    
    // Delete the property from database
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    if (error) {
      console.log('[DEBUG] Property deletion error:', error);
      return c.json({ error: 'Failed to delete property', details: error.message }, 500);
    }
    
    // Clean up R2 files for this property
    console.log('[DEBUG] Cleaning up R2 files for property:', propertyId);
    await cleanupPropertyFiles(c.env, user.userId, propertyId);
    
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
    const user = c.get('user');
    const unitId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    // First, get the unit to ensure it exists and get the propertyId
    const { data: unit, error: fetchError } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single();
    
    if (fetchError || !unit) {
      console.log('[DEBUG] Unit not found for deletion:', unitId);
      return c.json({ error: 'Unit not found' }, 404);
    }
    
    // Delete the unit from database
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', unitId);
    
    if (error) {
      console.log('[DEBUG] Unit deletion error:', error);
      return c.json({ error: 'Failed to delete unit', details: error.message }, 500);
    }
    
    // Clean up R2 files for this unit
    console.log('[DEBUG] Cleaning up R2 files for unit:', unitId);
    await cleanupUnitFiles(c.env, user.userId, unitId, unit.propertyId);
    
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
    const user = c.get('user');
    const tenantId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    // First, get the tenant to ensure they exist
    const { data: tenant, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', tenantId)
      .eq('role', 'TENANT')
      .single();
    
    if (fetchError || !tenant) {
      console.log('[DEBUG] Tenant not found for deletion:', tenantId);
      return c.json({ error: 'Tenant not found' }, 404);
    }
    
    // Delete the tenant from database
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', tenantId)
      .eq('role', 'TENANT');
    
    if (error) {
      console.log('[DEBUG] Tenant deletion error:', error);
      return c.json({ error: 'Failed to delete tenant', details: error.message }, 500);
    }
    
    // Clean up R2 files for this tenant
    console.log('[DEBUG] Cleaning up R2 files for tenant:', tenantId);
    await cleanupTenantFiles(c.env, user.userId, tenantId);
    
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

app.delete('/api/maintenance/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DELETE MAINTENANCE REQUEST ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const maintenanceId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    // First, get the maintenance request to ensure it exists
    const { data: maintenance, error: fetchError } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', maintenanceId)
      .single();
    
    if (fetchError || !maintenance) {
      console.log('[DEBUG] Maintenance request not found for deletion:', maintenanceId);
      return c.json({ error: 'Maintenance request not found' }, 404);
    }
    
    // Delete the maintenance request from database
    const { error } = await supabase
      .from('maintenance_requests')
      .delete()
      .eq('id', maintenanceId);
    
    if (error) {
      console.log('[DEBUG] Maintenance request deletion error:', error);
      return c.json({ error: 'Failed to delete maintenance request', details: error.message }, 500);
    }
    
    // Clean up R2 files for this maintenance request
    console.log('[DEBUG] Cleaning up R2 files for maintenance request:', maintenanceId);
    await cleanupMaintenanceRequestFiles(c.env, user.userId, maintenanceId);
    
    console.log('[DEBUG] ===== MAINTENANCE REQUEST DELETED SUCCESSFULLY =====');
    return c.json({ success: true, message: 'Maintenance request deleted successfully' });
  } catch (error) {
    console.error('[DEBUG] ===== MAINTENANCE REQUEST DELETION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 6. TEAM MANAGEMENT ENDPOINTS
app.get('/api/team', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET TEAM MEMBERS ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    
    const { data: teamMembers, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'MAINTENANCE_STAFF', 'ACCOUNTING_STAFF', 'LEASING_AGENT', 'REGIONAL_MANAGER', 'SENIOR_MANAGER']);
    
    if (error) {
      console.log('[DEBUG] Team members query error:', error);
      return c.json({ error: 'Failed to fetch team members', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== TEAM MEMBERS FETCHED SUCCESSFULLY =====');
    return c.json({ success: true, data: teamMembers || [] });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM MEMBERS FETCH ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/team', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE TEAM MEMBER ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: teamMember, error } = await supabase
      .from('users')
      .insert({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber,
        password: body.password || 'defaultpassword123',
        role: body.role || 'PROPERTY_MANAGER',
        isActive: true,
        emailVerified: false,
        bio: body.bio,
        department: body.department,
        hireDate: body.hireDate,
        salary: body.salary,
        employmentStatus: body.employmentStatus,
        accessLevel: body.accessLevel || 'Basic',
        canManageProperties: body.canManageProperties || false,
        canManageTenants: body.canManageTenants || false,
        canManageMaintenance: body.canManageMaintenance || false,
        canViewReports: body.canViewReports || false,
      })
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Team member creation error:', error);
      return c.json({ error: 'Failed to create team member', details: error.message }, 500);
    }
    
    console.log('[DEBUG] ===== TEAM MEMBER CREATED SUCCESSFULLY =====');
    return c.json({ success: true, data: teamMember });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM MEMBER CREATION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Keep legacy managers endpoint for backward compatibility
app.get('/api/managers', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== LEGACY MANAGERS ENDPOINT CALLED =====');
  // Redirect to team endpoint
  return c.redirect('/api/team');
});

// Additional team management endpoints
app.get('/api/team/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET TEAM MEMBER BY ID ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    const teamMemberId = c.req.param('id');
    
    const { data: teamMember, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', teamMemberId)
      .single();
    
    if (error || !teamMember) {
      return c.json({ error: 'Team member not found' }, 404);
    }
    
    return c.json({ success: true, data: teamMember });
  } catch (error) {
    console.error('[DEBUG] Team member fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.put('/api/team/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPDATE TEAM MEMBER ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    const teamMemberId = c.req.param('id');
    const body = await c.req.json();
    
    const { data: teamMember, error } = await supabase
      .from('users')
      .update({
        first_name: body.firstName,
        last_name: body.lastName,
        phone_number: body.phoneNumber,
        role: body.role,
        is_active: body.isActive,
        bio: body.bio,
        department: body.department,
        hire_date: body.hireDate,
        salary: body.salary,
        employment_status: body.employmentStatus,
        access_level: body.accessLevel,
        can_manage_properties: body.canManageProperties,
        can_manage_tenants: body.canManageTenants,
        can_manage_maintenance: body.canManageMaintenance,
        can_view_reports: body.canViewReports,
      })
      .eq('id', teamMemberId)
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Team member update error:', error);
      return c.json({ error: 'Failed to update team member', details: error.message }, 500);
    }
    
    return c.json({ success: true, data: teamMember });
  } catch (error) {
    console.error('[DEBUG] Team member update error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.delete('/api/team/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DELETE TEAM MEMBER ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    const teamMemberId = c.req.param('id');
    
    // First, get the team member to ensure they exist
    const { data: teamMember, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', teamMemberId)
      .single();
    
    if (fetchError || !teamMember) {
      console.log('[DEBUG] Team member not found for deletion:', teamMemberId);
      return c.json({ error: 'Team member not found' }, 404);
    }
    
    // Soft delete the team member (set is_active to false)
    const { data: updatedTeamMember, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', teamMemberId)
      .select()
      .single();
    
    if (error) {
      console.log('[DEBUG] Team member deletion error:', error);
      return c.json({ error: 'Failed to delete team member', details: error.message }, 500);
    }
    
    // Clean up R2 files for this team member
    console.log('[DEBUG] Cleaning up R2 files for team member:', teamMemberId);
    await cleanupTeamMemberFiles(c.env, user.userId, teamMemberId);
    
    return c.json({ success: true, data: updatedTeamMember });
  } catch (error) {
    console.error('[DEBUG] Team member deletion error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/team/:id/assign-properties', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== ASSIGN PROPERTIES TO TEAM MEMBER ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    const teamMemberId = c.req.param('id');
    const body = await c.req.json();
    
    if (!body.propertyIds || !Array.isArray(body.propertyIds)) {
      return c.json({ error: 'Property IDs array is required' }, 400);
    }
    
    const { error } = await supabase
      .from('properties')
      .update({ manager_id: teamMemberId })
      .in('id', body.propertyIds);
    
    if (error) {
      console.log('[DEBUG] Property assignment error:', error);
      return c.json({ error: 'Failed to assign properties', details: error.message }, 500);
    }
    
    return c.json({ success: true, message: 'Properties assigned successfully' });
  } catch (error) {
    console.error('[DEBUG] Property assignment error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/team/:id/performance', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET TEAM MEMBER PERFORMANCE ENDPOINT CALLED =====');
  try {
    const supabase = getSupabaseClient(c.env);
    const teamMemberId = c.req.param('id');
    
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        id,
        name,
        units (
          id,
          lease_status,
          monthly_rent
        ),
        maintenance_requests (
          id,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('manager_id', teamMemberId);
    
    if (error) {
      console.log('[DEBUG] Performance fetch error:', error);
      return c.json({ error: 'Failed to fetch performance data', details: error.message }, 500);
    }
    
    // Calculate performance metrics
    const totalUnits = properties?.reduce((sum: number, prop: any) => sum + (prop.units?.length || 0), 0) || 0;
    const occupiedUnits = properties?.reduce((sum: number, prop: any) => 
      sum + (prop.units?.filter((unit: any) => unit.lease_status === 'LEASED').length || 0), 0) || 0;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    const performanceMetrics = {
      totalProperties: properties?.length || 0,
      totalUnits,
      occupiedUnits,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };
    
    return c.json({ success: true, data: performanceMetrics });
  } catch (error) {
    console.error('[DEBUG] Performance fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/team/:id/avatar', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPLOAD TEAM MEMBER AVATAR ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const teamMemberId = c.req.param('id');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Generate optimized account-based file path
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${user.userId}/team/${teamMemberId}`;
    const publicUrl = `https://cdn.ormi.com/${filePath}`;
    
    // For now, return a mock URL - in production, upload to Cloudflare R2
    const mockUrl = publicUrl;
    
    // Update team member's avatar URL
    const supabase = getSupabaseClient(c.env);
    const { error } = await supabase
      .from('users')
      .update({ avatar: mockUrl })
      .eq('id', teamMemberId);
    
    if (error) {
      console.log('[DEBUG] Avatar update error:', error);
      return c.json({ error: 'Failed to update avatar', details: error.message }, 500);
    }
    
    // Create document record for tracking
    const documentData = {
      fileName: file.name,
      fileUrl: mockUrl,
      fileType: file.type,
      fileSize: file.size,
      category: 'team',
      accountId: user.userId,
      uploadedBy: user.userId,
      tags: ['avatar', 'team-member'],
      description: `Avatar for team member ${teamMemberId}`,
      isPublic: false,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await supabase.from('documents').insert(documentData);
    
    return c.json({ 
      success: true, 
      data: { 
        url: mockUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        filePath
      } 
    });
  } catch (error) {
    console.error('[DEBUG] Avatar upload error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/team/:id/avatar/upload-url', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GENERATE TEAM MEMBER AVATAR UPLOAD URL ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const teamMemberId = c.req.param('id');
    const body = await c.req.json();
    
    if (!body.fileName || !body.contentType) {
      return c.json({ error: 'File name and content type are required' }, 400);
    }
    
    // Generate optimized account-based file path
    const fileName = `${Date.now()}-${body.fileName}`;
    const filePath = `${user.userId}/team/${teamMemberId}`;
    const publicUrl = `https://cdn.ormi.com/${filePath}`;
    
    // For now, return a mock upload URL - in production, generate R2 presigned URL
    const mockUploadUrl = `https://api.ormi.com/upload/mock-${teamMemberId}-${Date.now()}`;
    
    return c.json({ 
      success: true, 
      data: { 
        uploadUrl: mockUploadUrl,
        key: filePath,
        publicUrl: publicUrl
      } 
    });
  } catch (error) {
    console.error('[DEBUG] Upload URL generation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// TEAM MEMBER STORAGE ANALYTICS
app.get('/api/team/:id/storage-analytics', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET TEAM MEMBER STORAGE ANALYTICS ENDPOINT CALLED =====');
  try {
    const teamMemberId = c.req.param('id');
    const user = c.get('user');
    
    console.log('[DEBUG] Team member ID:', teamMemberId);
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock storage analytics for now - in production, calculate from R2
    const storageAnalytics = {
      accountId: user.userId,
      teamMemberId,
      totalStorage: 1024 * 1024 * 5, // 5MB
      storageBreakdown: {
        avatars: 1024 * 1024 * 1, // 1MB
        documents: 1024 * 1024 * 3, // 3MB
        media: 1024 * 1024 * 1, // 1MB
      },
      fileCounts: {
        total: 15,
        byType: {
          'image/jpeg': 5,
          'image/png': 3,
          'application/pdf': 7,
        },
      },
      lastUpdated: new Date().toISOString(),
    };
    
    console.log('[DEBUG] ===== TEAM MEMBER STORAGE ANALYTICS FETCHED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: storageAnalytics 
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM MEMBER STORAGE ANALYTICS ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to fetch team member storage analytics' }, 500);
  }
});

// BULK TEAM OPERATIONS
app.post('/api/team/bulk/assign-properties', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== BULK ASSIGN PROPERTIES TO TEAM MEMBERS ENDPOINT CALLED =====');
  try {
    const { teamMemberIds, propertyIds } = await c.req.json();
    const user = c.get('user');
    
    console.log('[DEBUG] Team member IDs:', teamMemberIds);
    console.log('[DEBUG] Property IDs:', propertyIds);
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock bulk assignment for now
    const results = teamMemberIds.map((teamMemberId: string) => ({
      teamMemberId,
      assignedProperties: propertyIds,
      success: true,
      message: `Assigned ${propertyIds.length} properties to team member ${teamMemberId}`
    }));
    
    console.log('[DEBUG] ===== BULK PROPERTY ASSIGNMENT COMPLETED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: { results, message: `Assigned ${propertyIds.length} properties to ${teamMemberIds.length} team members` }
    });
  } catch (error) {
    console.error('[DEBUG] ===== BULK PROPERTY ASSIGNMENT ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to bulk assign properties' }, 500);
  }
});

app.post('/api/team/bulk/update-status', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== BULK UPDATE TEAM MEMBER STATUS ENDPOINT CALLED =====');
  try {
    const { teamMemberIds, status } = await c.req.json();
    const user = c.get('user');
    
    console.log('[DEBUG] Team member IDs:', teamMemberIds);
    console.log('[DEBUG] Status:', status);
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock bulk status update for now
    const results = teamMemberIds.map((teamMemberId: string) => ({
      teamMemberId,
      status,
      success: true,
      message: `Updated status to ${status} for team member ${teamMemberId}`
    }));
    
    console.log('[DEBUG] ===== BULK STATUS UPDATE COMPLETED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: { results, message: `Updated status for ${teamMemberIds.length} team members` }
    });
  } catch (error) {
    console.error('[DEBUG] ===== BULK STATUS UPDATE ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to bulk update status' }, 500);
  }
});

app.post('/api/team/bulk/update-role', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== BULK UPDATE TEAM MEMBER ROLE ENDPOINT CALLED =====');
  try {
    const { teamMemberIds, role } = await c.req.json();
    const { user } = c.get('user');
    
    console.log('[DEBUG] Team member IDs:', teamMemberIds);
    console.log('[DEBUG] Role:', role);
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock bulk role update for now
    const results = teamMemberIds.map((teamMemberId: string) => ({
      teamMemberId,
      role,
      success: true,
      message: `Updated role to ${role} for team member ${teamMemberId}`
    }));
    
    console.log('[DEBUG] ===== BULK ROLE UPDATE COMPLETED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: { results, message: `Updated role for ${teamMemberIds.length} team members` }
    });
  } catch (error) {
    console.error('[DEBUG] ===== BULK ROLE UPDATE ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to bulk update role' }, 500);
  }
});

// TEAM IMPORT/EXPORT
app.post('/api/team/import', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== IMPORT TEAM MEMBERS ENDPOINT CALLED =====');
  try {
    const { user } = c.get('user');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    console.log('[DEBUG] File name:', file?.name);
    console.log('[DEBUG] File size:', file?.size);
    console.log('[DEBUG] User ID:', user.userId);
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Mock import for now
    const mockResults = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', success: true },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', success: true },
    ];
    
    console.log('[DEBUG] ===== TEAM MEMBERS IMPORTED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: { 
        results: mockResults, 
        message: `Imported ${mockResults.length} team members`,
        summary: {
          total: mockResults.length,
          successful: mockResults.filter(r => r.success).length,
          failed: mockResults.filter(r => !r.success).length
        }
      }
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM MEMBERS IMPORT ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to import team members' }, 500);
  }
});

app.get('/api/team/export', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== EXPORT TEAM MEMBERS ENDPOINT CALLED =====');
  try {
    const { user } = c.get('user');
    
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock team members data for export
    const teamMembersData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'PROPERTY_MANAGER',
        status: 'active',
        department: 'Property Management',
        hireDate: '2023-01-15',
        salary: 75000,
        employmentStatus: 'Full-time',
        accessLevel: 'Standard',
        canManageProperties: true,
        canManageTenants: true,
        canManageMaintenance: true,
        canViewReports: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'ASSISTANT_MANAGER',
        status: 'active',
        department: 'Property Management',
        hireDate: '2023-03-20',
        salary: 60000,
        employmentStatus: 'Full-time',
        accessLevel: 'Basic',
        canManageProperties: false,
        canManageTenants: true,
        canManageMaintenance: false,
        canViewReports: false
      }
    ];
    
    // Generate CSV content
    const headers = [
      'firstName', 'lastName', 'email', 'role', 'status',
      'department', 'hireDate', 'salary', 'employmentStatus', 'accessLevel',
      'canManageProperties', 'canManageTenants', 'canManageMaintenance', 'canViewReports'
    ];
    
    const csvContent = [
      headers.join(','),
      ...teamMembersData.map((member: any) => 
        headers.map(header => member[header] || '').join(',')
      )
    ].join('\n');
    
    console.log('[DEBUG] ===== TEAM MEMBERS EXPORTED SUCCESSFULLY =====');
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="team-members.csv"'
      }
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM MEMBERS EXPORT ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to export team members' }, 500);
  }
});

// TEAM ANALYTICS
app.get('/api/team/analytics/overview', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET TEAM ANALYTICS OVERVIEW ENDPOINT CALLED =====');
  try {
    const { user } = c.get('user');
    
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock team analytics overview
    const analytics = {
      totalTeamMembers: 12,
      activeTeamMembers: 10,
      inactiveTeamMembers: 2,
      averagePerformanceScore: 85.5,
      totalPropertiesAssigned: 45,
      averagePropertiesPerMember: 3.75,
      roleDistribution: {
        PROPERTY_MANAGER: 3,
        ASSISTANT_MANAGER: 2,
        MAINTENANCE_STAFF: 2,
        ACCOUNTING_STAFF: 2,
        LEASING_AGENT: 2,
        REGIONAL_MANAGER: 1,
        SENIOR_MANAGER: 0
      },
      departmentDistribution: {
        'Property Management': 5,
        'Maintenance': 2,
        'Accounting': 2,
        'Leasing': 2,
        'Administration': 1
      },
      recentHires: 3,
      upcomingReviews: 2,
      trainingNeeded: 1
    };
    
    console.log('[DEBUG] ===== TEAM ANALYTICS OVERVIEW FETCHED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: analytics 
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM ANALYTICS OVERVIEW ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to fetch team analytics overview' }, 500);
  }
});

app.get('/api/team/analytics/performance', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET TEAM PERFORMANCE ANALYTICS ENDPOINT CALLED =====');
  try {
    const { user } = c.get('user');
    
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock team performance analytics
    const analytics = {
      performanceMetrics: {
        averageOccupancyRate: 92.5,
        averageMaintenanceResponseTime: 2.3, // days
        averageTenantSatisfaction: 4.2, // out of 5
        averageCollectionRate: 96.8,
        averagePropertyValueGrowth: 5.2, // percentage
        averageLeaseRenewalRate: 78.5
      },
      topPerformers: [
        { id: '1', name: 'John Doe', performanceScore: 95, propertiesManaged: 8 },
        { id: '2', name: 'Jane Smith', performanceScore: 92, propertiesManaged: 6 },
        { id: '3', name: 'Mike Johnson', performanceScore: 89, propertiesManaged: 7 }
      ],
      performanceTrends: {
        monthly: [
          { month: 'Jan', averageScore: 82 },
          { month: 'Feb', averageScore: 84 },
          { month: 'Mar', averageScore: 86 },
          { month: 'Apr', averageScore: 88 },
          { month: 'May', averageScore: 90 },
          { month: 'Jun', averageScore: 92 }
        ]
      },
      goalAchievement: {
        occupancyGoal: 90,
        currentOccupancy: 92.5,
        maintenanceGoal: 3, // days
        currentMaintenance: 2.3,
        satisfactionGoal: 4.0,
        currentSatisfaction: 4.2
      }
    };
    
    console.log('[DEBUG] ===== TEAM PERFORMANCE ANALYTICS FETCHED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: analytics 
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM PERFORMANCE ANALYTICS ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to fetch team performance analytics' }, 500);
  }
});

app.get('/api/team/analytics/storage', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET TEAM STORAGE ANALYTICS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    console.log('[DEBUG] User ID:', user.userId);
    
    // Get all documents from database
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*');
    
    if (documentsError) {
      console.error('[DEBUG] Documents query error:', documentsError);
      return c.json({ error: 'Failed to fetch documents' }, 500);
    }
    
    // Calculate storage analytics from real data
    const totalStorage = documents?.reduce((sum, doc) => sum + (doc.fileSize || 0), 0) || 0;
    
    // Group by file type
    const byType: Record<string, number> = {};
    const byTypeCount: Record<string, number> = {};
    documents?.forEach(doc => {
      const type = doc.fileType || 'unknown';
      byType[type] = (byType[type] || 0) + (doc.fileSize || 0);
      byTypeCount[type] = (byTypeCount[type] || 0) + 1;
    });
    
    // Get team members (users with manager roles)
    const { data: teamMembers, error: teamError } = await supabase
      .from('users')
      .select('id, avatar')
      .in('role', ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'MAINTENANCE_STAFF', 'ACCOUNTING_STAFF', 'LEASING_AGENT', 'REGIONAL_MANAGER', 'SENIOR_MANAGER']);
    
    if (teamError) {
      console.error('[DEBUG] Team members query error:', teamError);
    }
    
    // Calculate team member storage (avatars)
    const teamMemberStorage = teamMembers?.reduce((sum, member) => {
      // Estimate avatar size (typically 50KB-200KB)
      return sum + (member.avatar ? 100 * 1024 : 0);
    }, 0) || 0;
    
    // Get properties with images
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, images');
    
    if (propertiesError) {
      console.error('[DEBUG] Properties query error:', propertiesError);
    }
    
    // Calculate property storage (images)
    const propertyStorage = properties?.reduce((sum, property) => {
      const imageCount = property.images?.length || 0;
      // Estimate image size (typically 500KB-2MB)
      return sum + (imageCount * 1024 * 1024);
    }, 0) || 0;
    
    // Get maintenance requests with images
    const { data: maintenanceRequests, error: maintenanceError } = await supabase
      .from('maintenance_requests')
      .select('id, images');
    
    if (maintenanceError) {
      console.error('[DEBUG] Maintenance requests query error:', maintenanceError);
    }
    
    // Calculate maintenance storage (images)
    const maintenanceStorage = maintenanceRequests?.reduce((sum, request) => {
      const imageCount = request.images?.length || 0;
      // Estimate image size (typically 500KB-2MB)
      return sum + (imageCount * 1024 * 1024);
    }, 0) || 0;
    
    // Calculate storage breakdown
    const storageBreakdown = {
      teamMembers: teamMemberStorage,
      properties: propertyStorage,
      tenants: totalStorage, // Documents are primarily tenant-related
      maintenance: maintenanceStorage,
      financial: 0, // Would need financial documents table
      marketing: 0, // Would need marketing materials table
      legal: 0, // Would need legal documents table
      templates: 0, // Would need templates table
      shared: 0, // Would need shared documents table
    };
    
    // Calculate file counts
    const fileCounts = {
      total: documents?.length || 0,
      byType: byTypeCount,
      byCategory: {
        teamMembers: teamMembers?.length || 0,
        properties: properties?.length || 0,
        tenants: documents?.length || 0,
        maintenance: maintenanceRequests?.length || 0,
        financial: 0,
        marketing: 0,
        legal: 0,
        templates: 0,
        shared: 0,
      }
    };
    
    // Calculate billing tier based on storage usage
    const storageLimit = 1024 * 1024 * 1024 * 100; // 100GB
    const billingTier = totalStorage > 1024 * 1024 * 1024 * 50 ? 'enterprise' : 
                       totalStorage > 1024 * 1024 * 1024 * 10 ? 'professional' : 'basic';
    const overageAmount = Math.max(0, totalStorage - storageLimit);
    const estimatedCost = billingTier === 'enterprise' ? 99.99 : 
                         billingTier === 'professional' ? 29.99 : 9.99;
    
    const storageAnalytics = {
      accountId: user.userId,
      totalStorage,
      storageBreakdown,
      fileCounts,
      billingTier,
      storageLimit,
      overageAmount,
      estimatedCost,
    };
    
    console.log('[DEBUG] ===== TEAM STORAGE ANALYTICS FETCHED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: storageAnalytics 
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM STORAGE ANALYTICS ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to fetch team storage analytics' }, 500);
  }
});

// TEAM TEMPLATES
app.get('/api/team/templates', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET TEAM TEMPLATES ENDPOINT CALLED =====');
  try {
    const { user } = c.get('user');
    
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock team templates
    const templates = [
      {
        id: '1',
        name: 'Property Manager Template',
        description: 'Standard template for property managers',
        role: 'PROPERTY_MANAGER',
        permissions: {
          canManageProperties: true,
          canManageTenants: true,
          canManageMaintenance: true,
          canViewReports: true
        },
        accessLevel: 'Standard',
        createdBy: user.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Leasing Agent Template',
        description: 'Template for leasing agents',
        role: 'LEASING_AGENT',
        permissions: {
          canManageProperties: false,
          canManageTenants: true,
          canManageMaintenance: false,
          canViewReports: false
        },
        accessLevel: 'Basic',
        createdBy: user.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    console.log('[DEBUG] ===== TEAM TEMPLATES FETCHED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: templates 
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM TEMPLATES ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to fetch team templates' }, 500);
  }
});

app.post('/api/team/templates', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE TEAM TEMPLATE ENDPOINT CALLED =====');
  try {
    const { user } = c.get('user');
    const templateData = await c.req.json();
    
    console.log('[DEBUG] Template data:', templateData);
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock template creation
    const template = {
      id: Date.now().toString(),
      ...templateData,
      createdBy: user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('[DEBUG] ===== TEAM TEMPLATE CREATED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: template 
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM TEMPLATE CREATION ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to create team template' }, 500);
  }
});

app.put('/api/team/templates/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPDATE TEAM TEMPLATE ENDPOINT CALLED =====');
  try {
    const templateId = c.req.param('id');
    const { user } = c.get('user');
    const templateData = await c.req.json();
    
    console.log('[DEBUG] Template ID:', templateId);
    console.log('[DEBUG] Template data:', templateData);
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock template update
    const template = {
      id: templateId,
      ...templateData,
      updatedBy: user.userId,
      updatedAt: new Date().toISOString()
    };
    
    console.log('[DEBUG] ===== TEAM TEMPLATE UPDATED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: template 
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM TEMPLATE UPDATE ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to update team template' }, 500);
  }
});

app.delete('/api/team/templates/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DELETE TEAM TEMPLATE ENDPOINT CALLED =====');
  try {
    const templateId = c.req.param('id');
    const { user } = c.get('user');
    
    console.log('[DEBUG] Template ID:', templateId);
    console.log('[DEBUG] User ID:', user.userId);
    
    // Mock template deletion
    const result = {
      id: templateId,
      deleted: true,
      deletedBy: user.userId,
      deletedAt: new Date().toISOString()
    };
    
    console.log('[DEBUG] ===== TEAM TEMPLATE DELETED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('[DEBUG] ===== TEAM TEMPLATE DELETE ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Failed to delete team template' }, 500);
  }
});

// 7. DOCUMENTS ENDPOINTS
app.get('/api/documents', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET DOCUMENTS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    // Get query parameters for filtering
    const category = c.req.query('category');
    const accountId = c.req.query('accountId') || user.userId; // Default to user's account
    
    let query = supabase
      .from('documents')
      .select('*')
      .eq('accountId', accountId);
    
    // Filter by category if specified
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data: documents, error } = await query.order('uploadedAt', { ascending: false });
    
    if (error) {
      console.error('[DEBUG] Documents query error:', error);
      return c.json({ error: 'Failed to fetch documents' }, 500);
    }
    
    console.log('[DEBUG] ===== DOCUMENTS FETCHED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: documents || [] 
    });
  } catch (error) {
    console.error('[DEBUG] ===== DOCUMENTS FETCH ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/documents/storage-usage', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GET DOCUMENTS STORAGE USAGE ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    // Get account ID from query or default to user's account
    const accountId = c.req.query('accountId') || user.userId;
    
    // Get all documents for this account
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('accountId', accountId);
    
    if (documentsError) {
      console.error('[DEBUG] Documents query error:', documentsError);
      return c.json({ error: 'Failed to fetch documents' }, 500);
    }
    
    // Calculate storage usage
    const totalStorage = documents?.reduce((sum, doc) => sum + (doc.fileSize || 0), 0) || 0;
    const storageLimit = 1024 * 1024 * 1024 * 10; // 10GB
    
    // Group by file type
    const usageByType: Record<string, number> = {};
    const fileCounts: Record<string, number> = {};
    documents?.forEach(doc => {
      const type = doc.fileType || 'unknown';
      usageByType[type] = (usageByType[type] || 0) + (doc.fileSize || 0);
      fileCounts[type] = (fileCounts[type] || 0) + 1;
    });
    
    // Group by category using the new category field
    const storageBreakdown: Record<string, number> = {
      team: 0,
      property: 0,
      tenant: 0,
      maintenance: 0,
      financial: 0,
      legal: 0,
      marketing: 0,
      templates: 0,
      shared: 0,
    };
    
    const fileCountsByCategory: Record<string, number> = {};
    
    documents?.forEach(doc => {
      const category = doc.category || 'shared';
      storageBreakdown[category] = (storageBreakdown[category] || 0) + (doc.fileSize || 0);
      fileCountsByCategory[category] = (fileCountsByCategory[category] || 0) + 1;
    });
    
    // Calculate billing
    const overageAmount = Math.max(0, totalStorage - storageLimit);
    const estimatedCost = (totalStorage / (1024 * 1024 * 1024)) * 0.02; // $0.02 per GB
    
    const storageUsage = {
      accountId,
      totalStorage,
      storageBreakdown,
      fileCounts: {
        total: documents?.length || 0,
        byType: fileCounts,
        byCategory: fileCountsByCategory
      },
      billingTier: 'professional',
      storageLimit,
      overageAmount,
      estimatedCost
    };
    
    console.log('[DEBUG] ===== DOCUMENTS STORAGE USAGE FETCHED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: storageUsage 
    });
  } catch (error) {
    console.error('[DEBUG] ===== DOCUMENTS STORAGE USAGE ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/documents', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE DOCUMENT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const supabase = getSupabaseClient(c.env);
    
    // Add account-based categorization
    const documentData = {
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileType: body.fileType,
      fileSize: body.fileSize,
      category: body.category || 'shared',
      accountId: body.accountId || user.userId,
      uploadedBy: user.userId,
      tenantId: body.tenantId,
      propertyId: body.propertyId,
      unitId: body.unitId,
      tags: body.tags || [],
      description: body.description,
      isPublic: body.isPublic || false,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { data: document, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();
    
    if (error) {
      console.error('[DEBUG] Document creation error:', error);
      return c.json({ error: 'Failed to create document' }, 500);
    }
    
    console.log('[DEBUG] ===== DOCUMENT CREATED SUCCESSFULLY =====');
    return c.json({ 
      success: true, 
      data: document 
    });
  } catch (error) {
    console.error('[DEBUG] ===== DOCUMENT CREATION ERROR =====');
    console.error('[DEBUG] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 7. DOCUMENT MANAGEMENT ENDPOINTS
app.delete('/api/documents/:id', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== DELETE DOCUMENT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const documentId = c.req.param('id');
    
    const supabase = getSupabaseClient(c.env);
    
    // First, get the document to ensure it exists and get the fileUrl
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (fetchError || !document) {
      console.log('[DEBUG] Document not found for deletion:', documentId);
      return c.json({ error: 'Document not found' }, 404);
    }
    
    // Delete the document from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    
    if (error) {
      console.log('[DEBUG] Document deletion error:', error);
      return c.json({ error: 'Failed to delete document', details: error.message }, 500);
    }
    
    // Clean up R2 file for this document
    console.log('[DEBUG] Cleaning up R2 file for document:', documentId);
    await cleanupDocumentFile(c.env, document.fileUrl);
    
    console.log('[DEBUG] ===== DOCUMENT DELETED SUCCESSFULLY =====');
    return c.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[DEBUG] ===== DOCUMENT DELETION ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 8. ANALYTICS ENDPOINTS
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
    const user = c.get('user');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'shared';
    const context = formData.get('context') as string || 'general';
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Generate account-based file path
    const fileName = `${Date.now()}-${file.name}`;
          const filePath = `${user.userId}/documents/${category}/${context}`;
    const publicUrl = `https://data.ormi.com/${filePath}`;
    
    // For now, return a mock URL - in production, upload to Cloudflare R2
    const mockUrl = publicUrl;
    
    // Create document record for tracking
    const supabase = getSupabaseClient(c.env);
    const documentData = {
      fileName: file.name,
      fileUrl: mockUrl,
      fileType: file.type,
      fileSize: file.size,
      category: category,
      accountId: user.userId,
      uploadedBy: user.userId,
      tags: [context, 'image'],
      description: `Image uploaded via ${context}`,
      isPublic: false,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await supabase.from('documents').insert(documentData);
    
    console.log('[DEBUG] ===== IMAGE UPLOAD SUCCESSFUL =====');
    return c.json({ 
      success: true, 
      data: { 
        url: mockUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        filePath
      } 
    });
  } catch (error) {
    console.error('[DEBUG] ===== IMAGE UPLOAD ERROR =====');
    console.error('[DEBUG] Error details:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/properties/:id/images', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPLOAD PROPERTY IMAGES ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const propertyId = c.req.param('id');
    console.log('[DEBUG] User ID:', user.userId);
    console.log('[DEBUG] Property ID:', propertyId);
    
    const formData = await c.req.formData();
    const files = formData.getAll('files') as File[];
    console.log('[DEBUG] Number of files received:', files.length);
    
    if (!files || files.length === 0) {
      return c.json({ error: 'No images provided' }, 400);
    }
    
    const supabase = getSupabaseClient(c.env);
    
    // Check if property exists first
    const { data: existingProperty, error: propertyError } = await supabase
      .from('properties')
      .select('id, images')
      .eq('id', propertyId)
      .single();
    
    if (propertyError || !existingProperty) {
      console.error('[DEBUG] Property not found:', propertyError);
      return c.json({ error: 'Property not found' }, 404);
    }
    
    console.log('[DEBUG] Property found, existing images:', existingProperty.images?.length || 0);
    
    const uploadedImages = [];
    
    // Import storage service
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(c.env);
    console.log('[DEBUG] Storage service created with env vars');
    
    for (const file of files) {
      if (file && file.size > 0) {
        try {
          console.log('[DEBUG] Processing file:', file.name, 'Size:', file.size);
          
          // Upload to R2 with optimized account-based path
          const buffer = await file.arrayBuffer();
          const filePath = `${user.userId}/property/${propertyId}`;
          console.log('[DEBUG] Uploading to optimized path:', filePath);
          
          const uploadResult = await storageService.uploadFile(new Uint8Array(buffer), file.name, file.type, filePath);
          console.log('[DEBUG] Upload successful, URL:', uploadResult.url);
          
          uploadedImages.push(uploadResult.url);
          
          // Create document record for tracking
          const documentData = {
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fileName: file.name,
            fileUrl: uploadResult.url,
            fileType: file.type,
            fileSize: file.size,
            category: 'property',
            accountId: user.userId,
            uploadedBy: user.userId,
            propertyId: propertyId,
            tags: ['property', 'image'],
            description: `Property image for property ${propertyId}`,
            isPublic: false,
            uploadedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const { error: docError } = await supabase.from('documents').insert(documentData);
          if (docError) {
            console.error('[DEBUG] Document creation error:', docError);
          } else {
            console.log('[DEBUG] Document record created successfully');
          }
        } catch (fileError) {
          console.error('[DEBUG] Error processing file:', file.name, fileError);
          console.error('[DEBUG] File details:', {
            name: file.name,
            size: file.size,
            type: file.type
          });
          throw fileError;
        }
      }
    }
    
    // Update property with new images
    const existingImages = existingProperty.images || [];
    const allImages = [...existingImages, ...uploadedImages];
    
    console.log('[DEBUG] Updating property with', uploadedImages.length, 'new images');
    console.log('[DEBUG] Total images after update:', allImages.length);
    
    const { error: updateError } = await supabase
      .from('properties')
      .update({ 
        images: allImages,
        updatedAt: new Date().toISOString()
      })
      .eq('id', propertyId);
    
    if (updateError) {
      console.error('[DEBUG] Property image update error:', updateError);
      return c.json({ error: 'Failed to update property images' }, 500);
    }
    
    console.log('[DEBUG] ===== PROPERTY IMAGES UPLOADED SUCCESSFULLY =====');
    return c.json({
      success: true,
      data: {
        images: allImages,
        uploadedCount: uploadedImages.length
      }
    });
  } catch (error) {
    console.error('[DEBUG] Property image upload error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/upload/document', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== UPLOAD DOCUMENT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'shared';
    const context = formData.get('context') as string || 'general';
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Import storage service
    const { createStorageService } = await import('./utils/storage');
    const storageService = createStorageService(c.env);
    
    // Upload to R2 with account-based path
    const buffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
          const filePath = `${user.userId}/documents/${category}/${context}`;
    const uploadResult = await storageService.uploadFile(Buffer.from(buffer), fileName, file.type, filePath);
    
    // Create document record for tracking
    const supabase = getSupabaseClient(c.env);
    const documentData = {
      fileName: file.name,
      fileUrl: uploadResult.url,
      fileType: file.type,
      fileSize: file.size,
      category: category,
      accountId: user.userId,
      uploadedBy: user.userId,
      tags: [context, 'document'],
      description: `Document uploaded via ${context}`,
      isPublic: false,
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await supabase.from('documents').insert(documentData);
    
    console.log('[DEBUG] ===== DOCUMENT UPLOAD SUCCESSFUL =====');
    return c.json({ 
      success: true, 
      data: { 
        url: uploadResult.url,
        filename: file.name,
        size: file.size,
        type: file.type,
        filePath: uploadResult.key
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

// Tenant Portal endpoints
app.post('/api/auth/tenant-login', async (c) => {
  console.log('[DEBUG] ===== TENANT LOGIN ENDPOINT CALLED =====');
  try {
    const body = await c.req.json();
    const { email, password } = body;
    console.log('[DEBUG] Tenant login attempt for email:', email);

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient(c.env);
    
    // Find tenant user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'TENANT')
      .single();

    if (error || !user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Check password
    const isValidPassword = password === user.password;
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      return c.json({ error: 'JWT secret not configured' }, 500);
    }

    const token = await createJWT(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret
    );

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
    });

  } catch (error) {
    console.error('[DEBUG] Tenant login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/tenants/profile', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT PROFILE ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();
    
    if (error || !dbUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
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
    console.error('[DEBUG] Tenant profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/tenants/dashboard', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT DASHBOARD ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    // Get tenant's units
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select(`
        *,
        property:properties(*)
      `)
      .eq('tenantId', user.userId);
    
    // Get tenant's payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('tenantId', user.userId)
      .order('dueDate', { ascending: false })
      .limit(5);
    
    // Get tenant's maintenance requests
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('tenantId', user.userId)
      .order('createdAt', { ascending: false })
      .limit(5);
    
    const dashboardData = {
      units: units || [],
      recentPayments: payments || [],
      recentMaintenance: maintenance || [],
      totalUnits: units?.length || 0,
      totalPayments: payments?.length || 0,
      totalMaintenance: maintenance?.length || 0,
      upcomingPayments: payments?.filter(p => p.status === 'PENDING') || [],
      urgentMaintenance: maintenance?.filter(m => m.priority === 'URGENT') || []
    };
    
    return c.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('[DEBUG] Tenant dashboard error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/tenants/documents', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT DOCUMENTS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    // Get tenant's documents (leases, receipts, etc.)
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('tenantId', user.userId)
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('[DEBUG] Documents query error:', error);
      return c.json({ error: 'Failed to fetch documents' }, 500);
    }
    
    return c.json({
      success: true,
      data: documents || []
    });
  } catch (error) {
    console.error('[DEBUG] Tenant documents error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/tenants/documents/upload', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT DOCUMENT UPLOAD ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const formData = await c.req.formData();
    const file = formData.get('document') as File;
    const type = formData.get('type') as string || 'document';
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Upload to Cloudflare R2 (mock for now, will implement real R2)
    const fileName = `${Date.now()}-${file.name}`;
            const fileUrl = `https://data.ormi.com/documents/${fileName}`;
    
    const supabase = getSupabaseClient(c.env);
    
    // Save document record
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        tenantId: user.userId,
        fileName: file.name,
        fileUrl: fileUrl,
        fileType: type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('[DEBUG] Document save error:', error);
      return c.json({ error: 'Failed to save document' }, 500);
    }
    
    return c.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('[DEBUG] Document upload error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/tenants/maintenance', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT MAINTENANCE ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    const { data: maintenance, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        unit:units(*)
      `)
      .eq('tenantId', user.userId)
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('[DEBUG] Maintenance query error:', error);
      return c.json({ error: 'Failed to fetch maintenance requests' }, 500);
    }
    
    return c.json({
      success: true,
      data: maintenance || []
    });
  } catch (error) {
    console.error('[DEBUG] Tenant maintenance error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/tenants/maintenance', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT MAINTENANCE SUBMIT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { title, description, priority, unitId, images } = body;
    
    if (!title || !description || !unitId) {
      return c.json({ error: 'Title, description, and unit are required' }, 400);
    }
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: maintenance, error } = await supabase
      .from('maintenance_requests')
      .insert({
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'SUBMITTED',
        tenantId: user.userId,
        unitId,
        images: images || [],
        createdAt: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('[DEBUG] Maintenance submit error:', error);
      return c.json({ error: 'Failed to submit maintenance request' }, 500);
    }
    
    return c.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('[DEBUG] Maintenance submit error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/tenants/checklists', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT CHECKLISTS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    // Get tenant's move-in/move-out checklists
    const { data: checklists, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('tenantId', user.userId)
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('[DEBUG] Checklists query error:', error);
      return c.json({ error: 'Failed to fetch checklists' }, 500);
    }
    
    return c.json({
      success: true,
      data: checklists || []
    });
  } catch (error) {
    console.error('[DEBUG] Tenant checklists error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/tenants/surveys', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT SURVEY SUBMIT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { propertyId, rating, feedback, category } = body;
    
    if (!propertyId || !rating) {
      return c.json({ error: 'Property ID and rating are required' }, 400);
    }
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: survey, error } = await supabase
      .from('tenant_surveys')
      .insert({
        tenantId: user.userId,
        propertyId,
        rating,
        feedback,
        category: category || 'GENERAL',
        submittedAt: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('[DEBUG] Survey submit error:', error);
      return c.json({ error: 'Failed to submit survey' }, 500);
    }
    
    return c.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('[DEBUG] Survey submit error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/tenants/community', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== TENANT COMMUNITY ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    // Get community announcements and events
    const { data: announcements, error } = await supabase
      .from('community_announcements')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('[DEBUG] Community query error:', error);
      return c.json({ error: 'Failed to fetch community data' }, 500);
    }
    
    return c.json({
      success: true,
      data: {
        announcements: announcements || [],
        events: [], // Will implement events later
        discussions: [] // Will implement discussions later
      }
    });
  } catch (error) {
    console.error('[DEBUG] Tenant community error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}); 

// Payment Processing endpoints with real Stripe integration
app.post('/api/payments/create-payment-intent', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== CREATE PAYMENT INTENT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { amount, currency = 'usd', paymentMethod, unitId, description } = body;
    
    if (!amount || !unitId) {
      return c.json({ error: 'Amount and unit ID are required' }, 400);
    }
    
    // Create payment intent with Stripe
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe secret key not configured' }, 500);
    }
    
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: paymentMethod === 'ach' ? ['us_bank_account'] : ['card'],
      metadata: {
        userId: user.userId,
        unitId,
        description: description || 'Rent payment'
      }
    });
    
    const supabase = getSupabaseClient(c.env);
    
    // Save payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        amount,
        currency,
        status: 'PENDING',
        method: paymentMethod === 'ach' ? 'STRIPE_ACH' : 'STRIPE_CARD',
        stripePaymentIntentId: paymentIntent.id,
        unitId,
        tenantId: user.userId,
        description,
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('[DEBUG] Payment save error:', error);
      return c.json({ error: 'Failed to save payment record' }, 500);
    }
    
    return c.json({
      success: true,
      data: {
        paymentIntent: paymentIntent,
        payment: payment
      }
    });
  } catch (error) {
    console.error('[DEBUG] Payment intent error:', error);
    return c.json({ error: 'Failed to create payment intent' }, 500);
  }
});

app.post('/api/payments/process-payment', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== PROCESS PAYMENT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { paymentIntentId, paymentMethodId } = body;
    
    if (!paymentIntentId) {
      return c.json({ error: 'Payment intent ID is required' }, 400);
    }
    
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe secret key not configured' }, 500);
    }
    
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
    
    if (paymentIntent.status === 'succeeded') {
      const supabase = getSupabaseClient(c.env);
      
      // Update payment record
      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status: 'PAID',
          paymentDate: new Date().toISOString(),
          stripePaymentId: paymentIntent.latest_charge
        })
        .eq('stripePaymentIntentId', paymentIntentId)
        .select()
        .single();
      
      if (error) {
        console.error('[DEBUG] Payment update error:', error);
        return c.json({ error: 'Failed to update payment record' }, 500);
      }
      
      return c.json({
        success: true,
        data: payment
      });
    } else {
      return c.json({ error: 'Payment failed' }, 400);
    }
  } catch (error) {
    console.error('[DEBUG] Process payment error:', error);
    return c.json({ error: 'Failed to process payment' }, 500);
  }
});

app.get('/api/payments/history', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== PAYMENT HISTORY ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const { searchParams } = new URL(c.req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const unitId = searchParams.get('unitId');
    
    const supabase = getSupabaseClient(c.env);
    
    let query = supabase
      .from('payments')
      .select(`
        *,
        unit:units(*),
        tenant:users(*)
      `)
      .eq('tenantId', user.userId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (unitId) {
      query = query.eq('unitId', unitId);
    }
    
    const { data: payments, error, count } = await query
      .order('createdAt', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) {
      console.error('[DEBUG] Payment history error:', error);
      return c.json({ error: 'Failed to fetch payment history' }, 500);
    }
    
    return c.json({
      success: true,
      data: {
        payments: payments || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });
  } catch (error) {
    console.error('[DEBUG] Payment history error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/payments/analytics', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== PAYMENT ANALYTICS ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const supabase = getSupabaseClient(c.env);
    
    // Get payment analytics
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenantId', user.userId);
    
    if (error) {
      console.error('[DEBUG] Payment analytics error:', error);
      return c.json({ error: 'Failed to fetch payment analytics' }, 500);
    }
    
    const totalPayments = payments?.length || 0;
    const paidPayments = payments?.filter(p => p.status === 'PAID').length || 0;
    const pendingPayments = payments?.filter(p => p.status === 'PENDING').length || 0;
    const totalAmount = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const paidAmount = payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    
    const analytics = {
      totalPayments,
      paidPayments,
      pendingPayments,
      totalAmount,
      paidAmount,
      collectionRate: totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0,
      averagePayment: totalPayments > 0 ? totalAmount / totalPayments : 0
    };
    
    return c.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('[DEBUG] Payment analytics error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/payments/schedule', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== SCHEDULE PAYMENT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { amount, unitId, frequency, startDate, description } = body;
    
    if (!amount || !unitId || !frequency || !startDate) {
      return c.json({ error: 'Amount, unit ID, frequency, and start date are required' }, 400);
    }
    
    const supabase = getSupabaseClient(c.env);
    
    // Create recurring payment schedule
    const { data: schedule, error } = await supabase
      .from('payment_schedules')
      .insert({
        tenantId: user.userId,
        unitId,
        amount,
        frequency, // monthly, weekly, etc.
        startDate,
        description,
        isActive: true,
        createdAt: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('[DEBUG] Schedule payment error:', error);
      return c.json({ error: 'Failed to create payment schedule' }, 500);
    }
    
    return c.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('[DEBUG] Schedule payment error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/payments/receipts/:paymentId', authMiddleware, async (c) => {
  console.log('[DEBUG] ===== GENERATE RECEIPT ENDPOINT CALLED =====');
  try {
    const user = c.get('user');
    const paymentId = c.req.param('paymentId');
    
    const supabase = getSupabaseClient(c.env);
    
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        unit:units(*),
        tenant:users(*)
      `)
      .eq('id', paymentId)
      .eq('tenantId', user.userId)
      .single();
    
    if (error || !payment) {
      return c.json({ error: 'Payment not found' }, 404);
    }
    
    // Generate receipt data
    const receipt = {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentDate: payment.paymentDate,
      method: payment.method,
      description: payment.description,
      unit: payment.unit,
      tenant: payment.tenant,
      receiptNumber: `RCP-${payment.id.substring(0, 8).toUpperCase()}`,
      generatedAt: new Date().toISOString()
    };
    
    return c.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('[DEBUG] Generate receipt error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/payments/webhook', async (c) => {
  console.log('[DEBUG] ===== STRIPE WEBHOOK ENDPOINT CALLED =====');
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');
    
    if (!signature || !c.env.STRIPE_WEBHOOK_SECRET) {
      return c.json({ error: 'Missing signature or webhook secret' }, 400);
    }
    
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      c.env.STRIPE_WEBHOOK_SECRET
    );
    
    const supabase = getSupabaseClient(c.env);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await supabase
          .from('payments')
          .update({
            status: 'PAID',
            paymentDate: new Date().toISOString(),
            stripePaymentId: paymentIntent.latest_charge
          })
          .eq('stripePaymentIntentId', paymentIntent.id);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await supabase
          .from('payments')
          .update({
            status: 'FAILED'
          })
          .eq('stripePaymentIntentId', failedPayment.id);
        break;
    }
    
    return c.json({ received: true });
  } catch (error) {
    console.error('[DEBUG] Webhook error:', error);
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }
}); 

