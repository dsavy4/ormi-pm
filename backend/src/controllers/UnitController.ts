import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';

export class UnitController {
  /**
   * Get all units for a property
   */
  async getByPropertyId(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.param('propertyId');
      
      // Verify user owns the property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .eq('owner_id', user.userId)
        .single();
      
      if (propertyError || !property) {
        return c.json({ error: 'Property not found or access denied' }, 404);
      }
      
      const { data: units, error } = await supabase
        .from('units')
        .select(`
          *,
          tenant:users!units_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          property:properties!units_property_id_fkey (
            id,
            name,
            address
          ),
          payments (
            id,
            amount,
            due_date,
            status,
            payment_date
          )
        `)
        .eq('property_id', propertyId)
        .order('unit_number');
      
      if (error) {
        console.error('Units fetch error:', error);
        return c.json({ error: 'Failed to fetch units' }, 500);
      }
      
      return c.json(units || []);
      
    } catch (error) {
      console.error('Units fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get single unit by ID
   */
  async getById(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const unitId = c.req.param('id');
      
      const { data: unit, error } = await supabase
        .from('units')
        .select(`
          *,
          tenant:users!units_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          property:properties!units_property_id_fkey (
            id,
            name,
            address,
            owner_id
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
            created_at
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (error || !unit) {
        return c.json({ error: 'Unit not found' }, 404);
      }
      
      // Verify user owns the property
      if (unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      return c.json(unit);
      
    } catch (error) {
      console.error('Unit fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Create new unit
   */
  async create(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      const { 
        propertyId, 
        unitNumber, 
        monthlyRent, 
        securityDeposit, 
        leaseStatus = 'VACANT',
        notes 
      } = body;
      
      if (!propertyId || !unitNumber || !monthlyRent || !securityDeposit) {
        return c.json({ error: 'Property ID, unit number, monthly rent, and security deposit are required' }, 400);
      }
      
      // Verify user owns the property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .eq('owner_id', user.userId)
        .single();
      
      if (propertyError || !property) {
        return c.json({ error: 'Property not found or access denied' }, 404);
      }
      
      // Check if unit number already exists for this property
      const { data: existingUnit } = await supabase
        .from('units')
        .select('id')
        .eq('property_id', propertyId)
        .eq('unit_number', unitNumber)
        .single();
      
      if (existingUnit) {
        return c.json({ error: 'Unit number already exists for this property' }, 400);
      }
      
      const { data: unit, error } = await supabase
        .from('units')
        .insert([
          {
            property_id: propertyId,
            unit_number: unitNumber,
            monthly_rent: monthlyRent,
            security_deposit: securityDeposit,
            lease_status: leaseStatus,
            notes
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Unit creation error:', error);
        return c.json({ error: 'Failed to create unit' }, 500);
      }
      
      return c.json(unit);
      
    } catch (error) {
      console.error('Unit creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update unit
   */
  async update(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const unitId = c.req.param('id');
      const body = await c.req.json();
      
      // Verify user owns the property
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          property:properties!units_property_id_fkey (
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (unitError || !unit || unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Unit not found or access denied' }, 404);
      }
      
      const { 
        unitNumber, 
        monthlyRent, 
        securityDeposit, 
        leaseStatus,
        leaseStart,
        leaseEnd,
        notes 
      } = body;
      
      const updateData: any = {};
      if (unitNumber !== undefined) updateData.unit_number = unitNumber;
      if (monthlyRent !== undefined) updateData.monthly_rent = monthlyRent;
      if (securityDeposit !== undefined) updateData.security_deposit = securityDeposit;
      if (leaseStatus !== undefined) updateData.lease_status = leaseStatus;
      if (leaseStart !== undefined) updateData.lease_start = leaseStart;
      if (leaseEnd !== undefined) updateData.lease_end = leaseEnd;
      if (notes !== undefined) updateData.notes = notes;
      
      const { data: updatedUnit, error } = await supabase
        .from('units')
        .update(updateData)
        .eq('id', unitId)
        .select()
        .single();
      
      if (error) {
        console.error('Unit update error:', error);
        return c.json({ error: 'Failed to update unit' }, 500);
      }
      
      return c.json(updatedUnit);
      
    } catch (error) {
      console.error('Unit update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Delete unit
   */
  async delete(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const unitId = c.req.param('id');
      
      // Verify user owns the property and check if unit has active lease
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          lease_status,
          tenant_id,
          property:properties!units_property_id_fkey (
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (unitError || !unit || unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Unit not found or access denied' }, 404);
      }
      
      if (unit.lease_status === 'LEASED' || unit.tenant_id) {
        return c.json({ error: 'Cannot delete unit with active lease' }, 400);
      }
      
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);
      
      if (error) {
        console.error('Unit deletion error:', error);
        return c.json({ error: 'Failed to delete unit' }, 500);
      }
      
      return c.json({ message: 'Unit deleted successfully' });
      
    } catch (error) {
      console.error('Unit deletion error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Assign tenant to unit
   */
  async assignTenant(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const unitId = c.req.param('id');
      const body = await c.req.json();
      
      const { tenantId, leaseStart, leaseEnd } = body;
      
      if (!tenantId || !leaseStart || !leaseEnd) {
        return c.json({ error: 'Tenant ID, lease start, and lease end are required' }, 400);
      }
      
      // Verify user owns the property
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          lease_status,
          property:properties!units_property_id_fkey (
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (unitError || !unit || unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Unit not found or access denied' }, 404);
      }
      
      if (unit.lease_status === 'LEASED') {
        return c.json({ error: 'Unit is already leased' }, 400);
      }
      
      // Verify tenant exists
      const { data: tenant, error: tenantError } = await supabase
        .from('users')
        .select('id')
        .eq('id', tenantId)
        .eq('role', 'TENANT')
        .single();
      
      if (tenantError || !tenant) {
        return c.json({ error: 'Tenant not found' }, 404);
      }
      
      const { data: updatedUnit, error } = await supabase
        .from('units')
        .update({
          tenant_id: tenantId,
          lease_status: 'LEASED',
          lease_start: leaseStart,
          lease_end: leaseEnd
        })
        .eq('id', unitId)
        .select()
        .single();
      
      if (error) {
        console.error('Tenant assignment error:', error);
        return c.json({ error: 'Failed to assign tenant' }, 500);
      }
      
      return c.json(updatedUnit);
      
    } catch (error) {
      console.error('Tenant assignment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Remove tenant from unit
   */
  async removeTenant(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const unitId = c.req.param('id');
      
      // Verify user owns the property
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          property:properties!units_property_id_fkey (
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (unitError || !unit || unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Unit not found or access denied' }, 404);
      }
      
      const { data: updatedUnit, error } = await supabase
        .from('units')
        .update({
          tenant_id: null,
          lease_status: 'VACANT',
          lease_start: null,
          lease_end: null
        })
        .eq('id', unitId)
        .select()
        .single();
      
      if (error) {
        console.error('Tenant removal error:', error);
        return c.json({ error: 'Failed to remove tenant' }, 500);
      }
      
      return c.json(updatedUnit);
      
    } catch (error) {
      console.error('Tenant removal error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}

export const unitController = new UnitController(); 