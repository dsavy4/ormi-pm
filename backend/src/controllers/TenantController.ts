import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';

export class TenantController {
  /**
   * Get all tenants for authenticated user
   */
  async getAll(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      // Get all tenants from units owned by the user
      const { data: tenants, error } = await supabase
        .from('users')
        .select(`
          *,
          units:units!units_tenant_id_fkey (
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
              state,
              owner_id
            )
          ),
          payments (
            id,
            amount,
            due_date,
            status,
            payment_date
          )
        `)
        .eq('role', 'TENANT')
        .not('units', 'is', null);
      
      if (error) {
        console.error('Tenants fetch error:', error);
        return c.json({ error: 'Failed to fetch tenants' }, 500);
      }
      
      // Filter tenants to only include those in properties owned by the user
      const filteredTenants = tenants?.filter((tenant: any) => 
        tenant.units?.some((unit: any) => unit.property.owner_id === user.userId)
      ) || [];
      
      return c.json(filteredTenants);
      
    } catch (error) {
      console.error('Tenants fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get tenant by ID
   */
  async getById(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const tenantId = c.req.param('id');
      
      const { data: tenant, error } = await supabase
        .from('users')
        .select(`
          *,
          units:units!units_tenant_id_fkey (
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
              state,
              owner_id
            )
          ),
          payments (
            id,
            amount,
            due_date,
            status,
            payment_date,
            method
          ),
          maintenance_requests (
            id,
            title,
            description,
            status,
            priority,
            created_at,
            unit:units!maintenance_requests_unit_id_fkey (
              unit_number,
              property:properties!units_property_id_fkey (
                name
              )
            )
          )
        `)
        .eq('id', tenantId)
        .eq('role', 'TENANT')
        .single();
      
      if (error || !tenant) {
        return c.json({ error: 'Tenant not found' }, 404);
      }
      
      // Verify user owns the property
      const hasAccess = tenant.units?.some((unit: any) => 
        unit.property.owner_id === user.userId
      );
      
      if (!hasAccess) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      return c.json(tenant);
      
    } catch (error) {
      console.error('Tenant fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Create new tenant
   */
  async create(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const body = await c.req.json();
      
      const { 
        email, 
        firstName, 
        lastName, 
        phoneNumber,
        password 
      } = body;
      
      if (!email || !firstName || !lastName || !password) {
        return c.json({ error: 'Email, first name, last name, and password are required' }, 400);
      }
      
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        return c.json({ error: 'Email already exists' }, 400);
      }
      
      // Hash password (you might want to use a proper password hashing library)
      const hashedPassword = await hashPassword(password);
      
      const { data: tenant, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            password: hashedPassword,
            role: 'TENANT',
            is_active: true
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Tenant creation error:', error);
        return c.json({ error: 'Failed to create tenant' }, 500);
      }
      
      // Remove password from response
      const { password: _, ...tenantWithoutPassword } = tenant;
      
      return c.json(tenantWithoutPassword);
      
    } catch (error) {
      console.error('Tenant creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update tenant
   */
  async update(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const tenantId = c.req.param('id');
      const body = await c.req.json();
      
      // Verify user has access to this tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('users')
        .select(`
          id,
          units:units!units_tenant_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', tenantId)
        .eq('role', 'TENANT')
        .single();
      
      if (tenantError || !tenant) {
        return c.json({ error: 'Tenant not found' }, 404);
      }
      
      const hasAccess = tenant.units?.some((unit: any) => 
        unit.property.owner_id === user.userId
      );
      
      if (!hasAccess) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      const { 
        firstName, 
        lastName, 
        phoneNumber,
        isActive 
      } = body;
      
      const updateData: any = {};
      if (firstName !== undefined) updateData.first_name = firstName;
      if (lastName !== undefined) updateData.last_name = lastName;
      if (phoneNumber !== undefined) updateData.phone_number = phoneNumber;
      if (isActive !== undefined) updateData.is_active = isActive;
      
      const { data: updatedTenant, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', tenantId)
        .select()
        .single();
      
      if (error) {
        console.error('Tenant update error:', error);
        return c.json({ error: 'Failed to update tenant' }, 500);
      }
      
      // Remove password from response
      const { password: _, ...tenantWithoutPassword } = updatedTenant;
      
      return c.json(tenantWithoutPassword);
      
    } catch (error) {
      console.error('Tenant update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Delete tenant
   */
  async delete(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const tenantId = c.req.param('id');
      
      // Verify user has access to this tenant and check if tenant has active leases
      const { data: tenant, error: tenantError } = await supabase
        .from('users')
        .select(`
          id,
          units:units!units_tenant_id_fkey (
            id,
            lease_status,
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', tenantId)
        .eq('role', 'TENANT')
        .single();
      
      if (tenantError || !tenant) {
        return c.json({ error: 'Tenant not found' }, 404);
      }
      
      const hasAccess = tenant.units?.some((unit: any) => 
        unit.property.owner_id === user.userId
      );
      
      if (!hasAccess) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      // Check if tenant has active leases
      const hasActiveLeases = tenant.units?.some((unit: any) => 
        unit.lease_status === 'LEASED'
      );
      
      if (hasActiveLeases) {
        return c.json({ error: 'Cannot delete tenant with active leases' }, 400);
      }
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', tenantId);
      
      if (error) {
        console.error('Tenant deletion error:', error);
        return c.json({ error: 'Failed to delete tenant' }, 500);
      }
      
      return c.json({ message: 'Tenant deleted successfully' });
      
    } catch (error) {
      console.error('Tenant deletion error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get tenant payment history
   */
  async getPaymentHistory(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const tenantId = c.req.param('id');
      
      // Verify user has access to this tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('users')
        .select(`
          id,
          units:units!units_tenant_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', tenantId)
        .eq('role', 'TENANT')
        .single();
      
      if (tenantError || !tenant) {
        return c.json({ error: 'Tenant not found' }, 404);
      }
      
      const hasAccess = tenant.units?.some((unit: any) => 
        unit.property.owner_id === user.userId
      );
      
      if (!hasAccess) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          unit:units!payments_unit_id_fkey (
            unit_number,
            property:properties!units_property_id_fkey (
              name,
              address
            )
          )
        `)
        .eq('tenant_id', tenantId)
        .order('due_date', { ascending: false });
      
      if (error) {
        console.error('Payment history fetch error:', error);
        return c.json({ error: 'Failed to fetch payment history' }, 500);
      }
      
      return c.json(payments || []);
      
    } catch (error) {
      console.error('Payment history fetch error:', error);
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
      const tenantId = c.req.param('id');
      
      // Verify user has access to this tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('users')
        .select(`
          id,
          units:units!units_tenant_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', tenantId)
        .eq('role', 'TENANT')
        .single();
      
      if (tenantError || !tenant) {
        return c.json({ error: 'Tenant not found' }, 404);
      }
      
      const hasAccess = tenant.units?.some((unit: any) => 
        unit.property.owner_id === user.userId
      );
      
      if (!hasAccess) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      const { data: maintenanceRequests, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          unit:units!maintenance_requests_unit_id_fkey (
            unit_number,
            property:properties!units_property_id_fkey (
              name,
              address
            )
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Maintenance requests fetch error:', error);
        return c.json({ error: 'Failed to fetch maintenance requests' }, 500);
      }
      
      return c.json(maintenanceRequests || []);
      
    } catch (error) {
      console.error('Maintenance requests fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}

// Simple password hashing function - in production, use bcrypt or similar
async function hashPassword(password: string): Promise<string> {
  // This is a placeholder - implement proper password hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const tenantController = new TenantController(); 