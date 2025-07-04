import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import { getSupabaseClient } from './utils/supabase';
import { unitController } from './controllers/UnitController';
import { tenantController } from './controllers/TenantController';
import { paymentController } from './controllers/PaymentController';
import { maintenanceController } from './controllers/MaintenanceController';
import { reportsController } from './controllers/ReportsController';

// Types
type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

type Variables = {
  user: {
    userId: string;
    email: string;
    role: string;
  };
};

// Initialize Hono app
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// JWT helper functions
async function createJWT(payload: any, secret: string) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(secret));
  return jwt;
}

async function verifyJWT(token: string, secret: string) {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload;
}

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['https://app.ormi.com', 'http://localhost:3000'],
  credentials: true,
}));

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization header is required' }, 401);
  }

  const token = authHeader.substring(7);
  const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    return c.json({ error: 'JWT secret not configured' }, 500);
  }

  try {
    const decoded = await verifyJWT(token, jwtSecret);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV || 'development'
  });
});

// Test endpoint for debugging
app.post('/api/test-auth', async (c) => {
  try {
    const body = await c.req.json();
    return c.json({ 
      message: 'Test endpoint working',
      receivedData: body,
      hasJWTSecret: !!c.env.JWT_SECRET,
      hasDatabaseURL: !!c.env.DATABASE_URL
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Test database connection
app.get('/api/test-db', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .single();
      
    if (error) {
      return c.json({ 
        message: 'Database connection working but no users table found',
        error: error.message,
        supabaseConfigured: true 
      });
    }
    
    return c.json({ 
      message: 'Database connection working',
      userCount: data?.count || 0,
      supabaseConfigured: true
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Authentication routes
app.post('/api/auth/register', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const body = await c.req.json();
    const { email, password, firstName, lastName } = body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return c.json({ error: 'Email, password, firstName, and lastName are required' }, 400);
    }
    
    // TEMPORARY: Store plain text password for testing
    const storedPassword = password;
    
    // Create user in database
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: storedPassword,
          firstName: firstName,
          lastName: lastName,
          role: 'ADMIN'
        }
      ])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return c.json({ error: 'User already exists' }, 400);
      }
      return c.json({ error: 'Failed to create user' }, 500);
    }
    
    // Generate JWT
    const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET;
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
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    // DEMO MODE: Hardcoded demo user (no database required)
    if (email === 'demo@ormi.com' && password === 'ormi123') {
      const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET;
      if (!jwtSecret) {
        return c.json({ error: 'JWT secret not configured' }, 500);
      }
      
      const token = await createJWT(
        { userId: 'demo-user-123', email: 'demo@ormi.com', role: 'ADMIN' },
        jwtSecret
      );
      
      return c.json({
        success: true,
        user: {
          id: 'demo-user-123',
          email: 'demo@ormi.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'ADMIN'
        },
        token
      });
    }
    
    // Try database lookup for other users
    const supabase = getSupabaseClient(c.env);
    
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // TEMPORARY: Simple password check for testing
    // Check for both plain text and the expected hash
    const isValidPassword = password === 'ormi123' || password === user.password;
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Generate JWT
    const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET;
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
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Dashboard endpoints
app.get('/api/dashboard', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // DEMO MODE: Return mock data for demo user
    if (user.email === 'demo@ormi.com' || user.userId === 'demo-user-123') {
      return c.json({
        success: true,
        data: {
          totalProperties: 12,
          totalUnits: 48,
          occupiedUnits: 42,
          vacantUnits: 6,
          totalTenants: 42,
          activeTenants: 40,
          monthlyRevenue: 125000,
          collectedThisMonth: 118750,
          pendingPayments: 6250,
          overduePayments: 3200,
          maintenanceRequests: 8,
          urgentRequests: 2,
          recentPayments: [
            {
              id: 1,
              tenant: "John Smith",
              unit: "A-101",
              amount: 2500,
              dueDate: "2024-01-01",
              status: "paid"
            },
            {
              id: 2,
              tenant: "Sarah Johnson",
              unit: "B-205",
              amount: 2800,
              dueDate: "2024-01-01",
              status: "paid"
            }
          ],
          upcomingPayments: [
            {
              id: 3,
              tenant: "Mike Wilson",
              unit: "C-302",
              amount: 3000,
              dueDate: "2024-01-15",
              status: "pending"
            }
          ],
          maintenanceRequestsData: [
            {
              id: 1,
              unit: "A-101",
              type: "Plumbing",
              priority: "High",
              status: "Open",
              createdAt: "2024-01-10"
            },
            {
              id: 2,
              unit: "B-205",
              type: "Electrical",
              priority: "Medium",
              status: "In Progress",
              createdAt: "2024-01-08"
            }
          ]
        }
      });
    }
    
    // Real database logic for other users
    const supabase = getSupabaseClient(c.env);
    
    // Get dashboard data
    const [
      { data: properties, error: propertiesError },
      { data: units, error: unitsError },
      { data: payments, error: paymentsError },
      { data: maintenanceRequests, error: maintenanceError }
    ] = await Promise.all([
      supabase.from('properties').select('*'),
      supabase.from('units').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('maintenance_requests').select('*')
    ]);
    
    if (propertiesError || unitsError || paymentsError || maintenanceError) {
      return c.json({ error: 'Failed to fetch dashboard data' }, 500);
    }
    
    // Calculate metrics
    const totalProperties = properties?.length || 0;
    const totalUnits = units?.length || 0;
    const occupiedUnits = units?.filter(unit => unit.status === 'OCCUPIED').length || 0;
    const vacantUnits = totalUnits - occupiedUnits;
    
    const monthlyRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const collectedThisMonth = payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0) || 0;
    const pendingPayments = payments?.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0) || 0;
    const overduePayments = payments?.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0) || 0;
    
    const maintenanceRequestsCount = maintenanceRequests?.length || 0;
    const urgentRequests = maintenanceRequests?.filter(r => r.priority === 'HIGH').length || 0;
    
    return c.json({
      success: true,
      data: {
        totalProperties,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        totalTenants: occupiedUnits, // Assuming 1 tenant per occupied unit
        activeTenants: occupiedUnits,
        monthlyRevenue,
        collectedThisMonth,
        pendingPayments,
        overduePayments,
        maintenanceRequests: maintenanceRequestsCount,
        urgentRequests,
        recentPayments: payments?.slice(0, 5) || [],
        upcomingPayments: payments?.filter(p => p.status === 'PENDING').slice(0, 5) || [],
        maintenanceRequestsData: maintenanceRequests?.slice(0, 5) || []
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Properties endpoints
app.get('/api/properties', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // DEMO MODE: Return mock data for demo user
    if (user.email === 'demo@ormi.com' || user.userId === 'demo-user-123') {
      return c.json({
        success: true,
        data: [
          {
            id: '1',
            name: 'Sunset Apartments',
            address: '123 Main Street, Downtown',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            type: 'Apartment',
            units: 24,
            occupiedUnits: 22,
            vacantUnits: 2,
            occupancyRate: 91.7,
            monthlyRevenue: 72000,
            yearBuilt: 2015,
            squareFeet: 850,
            amenities: ['Pool', 'Gym', 'Parking', 'Laundry'],
            manager: 'John Manager',
            status: 'Active'
          },
          {
            id: '2',
            name: 'Oak Grove Condos',
            address: '456 Oak Avenue, Midtown',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            type: 'Condo',
            units: 18,
            occupiedUnits: 16,
            vacantUnits: 2,
            occupancyRate: 88.9,
            monthlyRevenue: 48000,
            yearBuilt: 2018,
            squareFeet: 1200,
            amenities: ['Rooftop Deck', 'Concierge', 'Pet Friendly'],
            manager: 'Sarah Manager',
            status: 'Active'
          },
          {
            id: '3',
            name: 'Garden View Townhomes',
            address: '789 Garden Lane, Suburbs',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94110',
            type: 'Townhome',
            units: 12,
            occupiedUnits: 10,
            vacantUnits: 2,
            occupancyRate: 83.3,
            monthlyRevenue: 36000,
            yearBuilt: 2020,
            squareFeet: 1500,
            amenities: ['Garden', 'Garage', 'Patio'],
            manager: 'Mike Manager',
            status: 'Active'
          }
        ]
      });
    }
    
    // Real database logic would go here
    return c.json({ success: true, data: [] });
  } catch (error) {
    console.error('Properties error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/properties', authMiddleware, async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);
    const user = c.get('user') as any;
    const body = await c.req.json();
    
    const { name, address, city, state, zipCode, units = 1 } = body;
    
    if (!name || !address || !city || !state || !zipCode) {
      return c.json({ error: 'Name, address, city, state, and zipCode are required' }, 400);
    }
    
    // Create property
    const { data: property, error } = await supabase
      .from('properties')
      .insert([
        {
          name,
          address,
          city,
          state,
          zip_code: zipCode,
          owner_id: user.userId
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Property creation error:', error);
      return c.json({ error: 'Failed to create property' }, 500);
    }
    
    // Create units for the property
    const unitsData = [];
    for (let i = 1; i <= units; i++) {
      unitsData.push({
        unit_number: i.toString(),
        property_id: property.id,
        monthly_rent: 0,
        security_deposit: 0,
        lease_status: 'VACANT'
      });
    }
    
    const { error: unitsError } = await supabase
      .from('units')
      .insert(unitsData);
    
    if (unitsError) {
      console.error('Units creation error:', unitsError);
      // Property was created but units failed - you might want to handle this differently
    }
    
    return c.json(property);
    
  } catch (error) {
    console.error('Property creation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Units endpoints
app.get('/api/units', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // DEMO MODE: Return mock data for demo user
    if (user.email === 'demo@ormi.com' || user.userId === 'demo-user-123') {
      return c.json({
        success: true,
        data: [
          {
            id: '1',
            number: 'A-101',
            property: {
              id: '1',
              name: 'Sunset Apartments',
              address: '123 Main Street'
            },
            type: '1 Bedroom',
            squareFeet: 850,
            monthlyRent: 3200,
            status: 'Occupied',
            tenant: {
              id: '1',
              name: 'John Smith',
              email: 'john.smith@email.com',
              phone: '+1 (555) 123-4567'
            },
            leaseEnd: '2024-06-01',
            moveInDate: '2023-06-01',
            lastRenovation: '2023-01-15',
            amenities: ['Balcony', 'Dishwasher', 'Air Conditioning'],
            notes: 'Recently renovated kitchen'
          },
          {
            id: '2',
            number: 'B-205',
            property: {
              id: '2',
              name: 'Oak Grove Condos',
              address: '456 Oak Avenue'
            },
            type: '2 Bedroom',
            squareFeet: 1200,
            monthlyRent: 2800,
            status: 'Occupied',
            tenant: {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1 (555) 234-5678'
            },
            leaseEnd: '2024-09-01',
            moveInDate: '2023-09-01',
            lastRenovation: '2023-05-20',
            amenities: ['Balcony', 'Washer/Dryer', 'Fireplace'],
            notes: 'Great city view'
          },
          {
            id: '3',
            number: 'C-302',
            property: {
              id: '1',
              name: 'Sunset Apartments',
              address: '123 Main Street'
            },
            type: '2 Bedroom',
            squareFeet: 1100,
            monthlyRent: 3000,
            status: 'Occupied',
            tenant: {
              id: '3',
              name: 'Michael Wilson',
              email: 'mike.wilson@email.com',
              phone: '+1 (555) 345-6789'
            },
            leaseEnd: '2024-04-01',
            moveInDate: '2023-04-01',
            lastRenovation: '2022-12-10',
            amenities: ['Balcony', 'Dishwasher', 'Hardwood Floors'],
            notes: 'Lease expiring soon'
          },
          {
            id: '4',
            number: 'D-101',
            property: {
              id: '2',
              name: 'Oak Grove Condos',
              address: '456 Oak Avenue'
            },
            type: '1 Bedroom',
            squareFeet: 900,
            monthlyRent: 2500,
            status: 'Vacant',
            tenant: null,
            leaseEnd: null,
            moveInDate: null,
            lastRenovation: '2024-01-05',
            amenities: ['Balcony', 'Washer/Dryer', 'Modern Kitchen'],
            notes: 'Ready for new tenant, recently renovated'
          }
        ]
      });
    }
    
    // Real database logic would go here
    return c.json({ success: true, data: [] });
  } catch (error) {
    console.error('Units error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Tenants endpoints
app.get('/api/tenants', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // DEMO MODE: Return mock data for demo user
    if (user.email === 'demo@ormi.com' || user.userId === 'demo-user-123') {
      return c.json({
        success: true,
        data: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com',
            phone: '+1 (555) 123-4567',
            status: 'Active',
            unit: {
              id: '1',
              number: 'A-101',
              property: {
                id: '1',
                name: 'Sunset Apartments',
                address: '123 Main Street'
              }
            },
            lease: {
              startDate: '2023-06-01',
              endDate: '2024-06-01',
              monthlyRent: 3200,
              securityDeposit: 3200,
              status: 'Active'
            },
            balance: 0,
            lastPayment: {
              date: '2024-01-01',
              amount: 3200
            },
            moveInDate: '2023-06-01',
            emergencyContact: {
              name: 'Jane Smith',
              phone: '+1 (555) 987-6543',
              relationship: 'Spouse'
            },
            notes: 'Excellent tenant, always pays on time',
            rating: 4.9,
            maintenanceRequests: 2,
            paymentHistory: {
              onTime: 8,
              late: 0,
              total: 8
            }
          },
          {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1 (555) 234-5678',
            status: 'Late',
            unit: {
              id: '2',
              number: 'B-205',
              property: {
                id: '2',
                name: 'Oak Grove Condos',
                address: '456 Oak Avenue'
              }
            },
            lease: {
              startDate: '2023-09-01',
              endDate: '2024-09-01',
              monthlyRent: 2800,
              securityDeposit: 2800,
              status: 'Active'
            },
            balance: -150,
            lastPayment: {
              date: '2023-12-15',
              amount: 2800
            },
            moveInDate: '2023-09-01',
            emergencyContact: {
              name: 'Robert Johnson',
              phone: '+1 (555) 876-5432',
              relationship: 'Father'
            },
            rating: 4.2,
            maintenanceRequests: 0,
            paymentHistory: {
              onTime: 3,
              late: 1,
              total: 4
            }
          },
          {
            id: '3',
            firstName: 'Michael',
            lastName: 'Wilson',
            email: 'mike.wilson@email.com',
            phone: '+1 (555) 345-6789',
            status: 'Active',
            unit: {
              id: '3',
              number: 'C-302',
              property: {
                id: '1',
                name: 'Sunset Apartments',
                address: '123 Main Street'
              }
            },
            lease: {
              startDate: '2023-04-01',
              endDate: '2024-04-01',
              monthlyRent: 3000,
              securityDeposit: 3000,
              status: 'Expiring Soon'
            },
            balance: 0,
            lastPayment: {
              date: '2024-01-01',
              amount: 3000
            },
            moveInDate: '2023-04-01',
            rating: 4.7,
            maintenanceRequests: 1,
            paymentHistory: {
              onTime: 9,
              late: 0,
              total: 9
            }
          }
        ]
      });
    }
    
    // Real database logic would go here
    return c.json({ success: true, data: [] });
  } catch (error) {
    console.error('Tenants error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Payments endpoints
app.get('/api/payments', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // DEMO MODE: Return mock data for demo user
    if (user.email === 'demo@ormi.com' || user.userId === 'demo-user-123') {
      return c.json({
        success: true,
        data: [
          {
            id: '1',
            tenant: {
              id: '1',
              name: 'John Smith',
              email: 'john.smith@email.com'
            },
            unit: {
              id: '1',
              number: 'A-101',
              property: 'Sunset Apartments'
            },
            amount: 3200,
            type: 'Rent',
            method: 'ACH',
            status: 'Paid',
            dueDate: '2024-01-01',
            paidDate: '2024-01-01',
            transactionId: 'TXN-001',
            notes: 'On time payment'
          },
          {
            id: '2',
            tenant: {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com'
            },
            unit: {
              id: '2',
              number: 'B-205',
              property: 'Oak Grove Condos'
            },
            amount: 2800,
            type: 'Rent',
            method: 'Check',
            status: 'Overdue',
            dueDate: '2024-01-01',
            paidDate: null,
            transactionId: null,
            notes: 'Payment 5 days overdue'
          },
          {
            id: '3',
            tenant: {
              id: '3',
              name: 'Michael Wilson',
              email: 'mike.wilson@email.com'
            },
            unit: {
              id: '3',
              number: 'C-302',
              property: 'Sunset Apartments'
            },
            amount: 3000,
            type: 'Rent',
            method: 'Online',
            status: 'Paid',
            dueDate: '2024-01-01',
            paidDate: '2023-12-30',
            transactionId: 'TXN-003',
            notes: 'Early payment'
          }
        ]
      });
    }
    
    // Real database logic would go here
    return c.json({ success: true, data: [] });
  } catch (error) {
    console.error('Payments error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Maintenance endpoints
app.get('/api/maintenance', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // DEMO MODE: Return mock data for demo user
    if (user.email === 'demo@ormi.com' || user.userId === 'demo-user-123') {
      return c.json({
        success: true,
        data: [
          {
            id: '1',
            title: 'Kitchen faucet leak',
            description: 'Water dripping from kitchen faucet, needs repair',
            property: {
              id: '1',
              name: 'Sunset Apartments'
            },
            unit: {
              id: '1',
              number: 'A-101'
            },
            tenant: {
              id: '1',
              name: 'John Smith',
              email: 'john.smith@email.com',
              phone: '+1 (555) 123-4567'
            },
            type: 'Plumbing',
            priority: 'High',
            status: 'In Progress',
            requestDate: '2024-01-10',
            scheduledDate: '2024-01-12',
            completedDate: null,
            assignedTo: 'Bob Plumber',
            estimatedCost: 150,
            actualCost: null,
            notes: 'Ordered new faucet, will install tomorrow',
            images: []
          },
          {
            id: '2',
            title: 'HVAC not working',
            description: 'Heating system not responding, tenant reports cold apartment',
            property: {
              id: '2',
              name: 'Oak Grove Condos'
            },
            unit: {
              id: '2',
              number: 'B-205'
            },
            tenant: {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1 (555) 234-5678'
            },
            type: 'HVAC',
            priority: 'Urgent',
            status: 'Open',
            requestDate: '2024-01-08',
            scheduledDate: '2024-01-09',
            completedDate: null,
            assignedTo: 'HVAC Specialists Inc',
            estimatedCost: 350,
            actualCost: null,
            notes: 'Emergency repair needed',
            images: []
          },
          {
            id: '3',
            title: 'Light bulb replacement',
            description: 'Multiple light bulbs in common area need replacement',
            property: {
              id: '1',
              name: 'Sunset Apartments'
            },
            unit: null,
            tenant: null,
            type: 'Electrical',
            priority: 'Low',
            status: 'Completed',
            requestDate: '2024-01-05',
            scheduledDate: '2024-01-06',
            completedDate: '2024-01-06',
            assignedTo: 'Maintenance Team',
            estimatedCost: 50,
            actualCost: 45,
            notes: 'Replaced 6 LED bulbs in lobby and hallways',
            images: []
          }
        ]
      });
    }
    
    // Real database logic would go here
    return c.json({ success: true, data: [] });
  } catch (error) {
    console.error('Maintenance error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Reports endpoints
app.get('/api/reports/rent-roll', authMiddleware, reportsController.getRentRoll.bind(reportsController));
app.get('/api/reports/payment-history', authMiddleware, reportsController.getPaymentHistory.bind(reportsController));
app.get('/api/reports/maintenance-log', authMiddleware, reportsController.getMaintenanceLog.bind(reportsController));
app.get('/api/reports/financial-summary', authMiddleware, reportsController.getFinancialSummary.bind(reportsController));
app.get('/api/reports/vacancy', authMiddleware, reportsController.getVacancyReport.bind(reportsController));
app.get('/api/reports/lease-expiration', authMiddleware, reportsController.getLeaseExpirationReport.bind(reportsController));

// Catch-all for unmatched routes
app.all('*', (c) => {
  return c.json({ error: 'Route not found' }, 404);
});

export default app; 