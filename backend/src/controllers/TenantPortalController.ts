import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';

export class TenantPortalController {
  /**
   * Tenant login
   */
  async login(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const body = await c.req.json();
      
      const { email, password } = body;

      if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      // Find tenant by email
      const { data: tenant, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'TENANT')
        .single();

      if (findError || !tenant) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Verify password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, tenant.password);

      if (!isValidPassword) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      if (!tenant.is_active) {
        return c.json({ error: 'Account is deactivated' }, 401);
      }

      // Generate JWT token for tenant
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          userId: tenant.id, 
          email: tenant.email, 
          role: tenant.role,
          type: 'tenant'
        },
        c.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Get tenant's property and unit information
      const { data: tenantInfo, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          id,
          unit_id,
          lease_start_date,
          lease_end_date,
          monthly_rent,
          units (
            id,
            unit_number,
            property_id,
            properties (
              id,
              name,
              address,
              city,
              state
            )
          )
        `)
        .eq('user_id', tenant.id)
        .single();

      const tenantData = {
        id: tenant.id,
        firstName: tenant.first_name,
        lastName: tenant.last_name,
        email: tenant.email,
        phone: tenant.phone_number || '',
        avatar: tenant.avatar,
        role: tenant.role,
        isActive: tenant.is_active,
        tenantInfo: tenantInfo || null,
        token
      };

      return c.json({ 
        success: true, 
        data: tenantData,
        message: 'Login successful'
      });
      
    } catch (error) {
      console.error('Tenant login error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get tenant dashboard data
   */
  async getDashboard(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      // Verify user is a tenant
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      // Get tenant's unit and property information
      const { data: tenantUnit, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          unit_number,
          monthly_rent,
          security_deposit,
          lease_status,
          lease_start,
          lease_end,
          property:properties!units_property_id_fkey (
            id,
            name,
            address,
            city,
            state
          )
        `)
        .eq('tenant_id', user.userId)
        .single();

      if (unitError || !tenantUnit) {
        return c.json({ error: 'No unit assigned to tenant' }, 404);
      }

      // Get recent payments
      const { data: recentPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', user.userId)
        .order('payment_date', { ascending: false })
        .limit(5);

      // Get maintenance requests
      const { data: maintenanceRequests, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', user.userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate current balance (simplified - would need more complex logic)
      const { data: pendingPayments, error: pendingError } = await supabase
        .from('payments')
        .select('amount')
        .eq('tenant_id', user.userId)
        .eq('status', 'PENDING');

      const currentBalance = pendingPayments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

      // Get next payment due
      const nextPayment = {
        dueDate: tenantUnit.lease_start, // Simplified - would calculate based on lease terms
        amount: tenantUnit.monthly_rent,
        status: 'Pending' as const
      };

      // Mock documents (would come from document management system)
      const documents = [
        {
          id: '1',
          name: 'Lease Agreement',
          type: 'Lease' as const,
          url: '/documents/lease.pdf',
          uploadedAt: tenantUnit.lease_start
        },
        {
          id: '2',
          name: 'Move-in Checklist',
          type: 'Other' as const,
          url: '/documents/checklist.pdf',
          uploadedAt: tenantUnit.lease_start
        }
      ];

      // Mock notifications (would come from notification system)
      const notifications = [
        {
          id: '1',
          title: 'Rent Due Reminder',
          message: 'Your rent payment of $' + tenantUnit.monthly_rent + ' is due in 3 days.',
          type: 'Payment' as const,
          read: false,
          createdAt: new Date().toISOString()
        }
      ];

      const dashboardData = {
        tenant: {
          id: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phoneNumber
        },
        unit: {
          id: tenantUnit.id,
          number: tenantUnit.unit_number,
          property: tenantUnit.property
        },
        lease: {
          startDate: tenantUnit.lease_start,
          endDate: tenantUnit.lease_end,
          monthlyRent: tenantUnit.monthly_rent,
          securityDeposit: tenantUnit.security_deposit,
          status: tenantUnit.lease_status
        },
        currentBalance,
        nextPayment,
        recentPayments: recentPayments || [],
        maintenanceRequests: maintenanceRequests || [],
        documents,
        notifications
      };

      return c.json({ success: true, data: dashboardData });
      
    } catch (error) {
      console.error('Tenant dashboard error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get tenant profile
   */
  async getProfile(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      const { data: tenant, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.userId)
        .single();

      if (error || !tenant) {
        return c.json({ error: 'Tenant not found' }, 404);
      }

      return c.json({ success: true, data: tenant });
      
    } catch (error) {
      console.error('Tenant profile error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update tenant profile
   */
  async updateProfile(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      const { firstName, lastName, phoneNumber } = body;

      const { data: updatedTenant, error } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return c.json({ error: 'Failed to update profile' }, 500);
      }

      return c.json({ success: true, data: updatedTenant });
      
    } catch (error) {
      console.error('Profile update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get tenant payments
   */
  async getPayments(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', user.userId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Payments fetch error:', error);
        return c.json({ error: 'Failed to fetch payments' }, 500);
      }

      return c.json({ success: true, data: payments || [] });
      
    } catch (error) {
      console.error('Payments fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Make a payment (mock implementation)
   */
  async makePayment(c: Context) {
    try {
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      // Mock payment processing
      const { amount, method } = body;

      const payment = {
        id: 'payment-' + Date.now(),
        amount,
        method,
        status: 'Paid',
        paymentDate: new Date().toISOString(),
        tenantId: user.userId
      };

      // In real implementation, this would integrate with Stripe or other payment processor
      return c.json({ 
        success: true, 
        data: payment,
        message: 'Payment processed successfully'
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get tenant maintenance requests
   */
  async getMaintenanceRequests(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', user.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Maintenance requests fetch error:', error);
        return c.json({ error: 'Failed to fetch maintenance requests' }, 500);
      }

      return c.json({ success: true, data: requests || [] });
      
    } catch (error) {
      console.error('Maintenance requests fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Submit maintenance request
   */
  async submitMaintenanceRequest(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      const { title, description, priority = 'MEDIUM', images = [] } = body;

      if (!title || !description) {
        return c.json({ error: 'Title and description are required' }, 400);
      }

      // Get tenant's unit
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('id')
        .eq('tenant_id', user.userId)
        .single();

      if (unitError || !unit) {
        return c.json({ error: 'No unit assigned to tenant' }, 404);
      }

      const { data: request, error } = await supabase
        .from('maintenance_requests')
        .insert([
          {
            unit_id: unit.id,
            tenant_id: user.userId,
            title,
            description,
            priority,
            status: 'SUBMITTED',
            images
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Maintenance request creation error:', error);
        return c.json({ error: 'Failed to create maintenance request' }, 500);
      }

      return c.json({ 
        success: true, 
        data: request,
        message: 'Maintenance request submitted successfully'
      });
      
    } catch (error) {
      console.error('Maintenance request error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get tenant documents
   */
  async getDocuments(c: Context) {
    try {
      const user = c.get('user') as any;
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      // Mock documents (would come from document management system)
      const documents = [
        {
          id: '1',
          name: 'Lease Agreement',
          type: 'Lease',
          url: '/documents/lease.pdf',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Move-in Checklist',
          type: 'Other',
          url: '/documents/checklist.pdf',
          uploadedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Payment Receipt - January 2024',
          type: 'Receipt',
          url: '/documents/receipt-jan-2024.pdf',
          uploadedAt: new Date().toISOString()
        }
      ];

      return c.json({ success: true, data: documents });
      
    } catch (error) {
      console.error('Documents fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Upload documents
   */
  async uploadDocuments(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      // This would handle file upload to Supabase Storage
      // For now, we'll return a success response
      
      return c.json({ 
        success: true, 
        message: 'Documents uploaded successfully',
        data: {
          uploadedCount: 1,
          documents: []
        }
      });
      
    } catch (error) {
      console.error('Document upload error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get tenant notifications
   */
  async getNotifications(c: Context) {
    try {
      const user = c.get('user') as any;
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      // Mock notifications (would come from notification system)
      const notifications = [
        {
          id: '1',
          title: 'Rent Due Reminder',
          message: 'Your rent payment is due in 3 days.',
          type: 'Payment',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Maintenance Update',
          message: 'Your maintenance request has been assigned to a technician.',
          type: 'Maintenance',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      return c.json({ success: true, data: notifications });
      
    } catch (error) {
      console.error('Notifications fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(c: Context) {
    try {
      const user = c.get('user') as any;
      const notificationId = c.req.param('id');
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      // Mock implementation (would update notification in database)
      return c.json({ 
        success: true, 
        message: 'Notification marked as read'
      });
      
    } catch (error) {
      console.error('Notification update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Contact property manager
   */
  async contactManager(c: Context) {
    try {
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      if (user.role !== 'TENANT') {
        return c.json({ error: 'Access denied. Tenant role required.' }, 403);
      }

      const { subject, message } = body;

      if (!subject || !message) {
        return c.json({ error: 'Subject and message are required' }, 400);
      }

      // Mock implementation (would send email/notification to property manager)
      const contact = {
        id: 'contact-' + Date.now(),
        tenantId: user.userId,
        subject,
        message,
        status: 'Sent',
        createdAt: new Date().toISOString()
      };

      return c.json({ 
        success: true, 
        data: contact,
        message: 'Message sent to property manager'
      });
      
    } catch (error) {
      console.error('Contact manager error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
} 