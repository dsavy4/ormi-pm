import { Context } from 'hono';
import { createClient } from '@supabase/supabase-js';

// Use Supabase client instead of Prisma for Cloudflare Workers compatibility
const supabase = createClient(
  'https://kmhmgutrhkzjnsgifsrl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttaG1ndXRyaGt6am5zZ2lmc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDYwNTYsImV4cCI6MjA2NzA4MjA1Nn0.Yeg2TBq3K9jddh-LQFHadr1rv_GaYS-SBVTfnZS6z3c'
);

export class UnitController {
  // Get all units for a specific property
  static async getUnitsByProperty(c: Context) {
    try {
      console.log('[DEBUG] getUnitsByProperty called');
      const propertyId = c.req.param('propertyId');
      console.log('[DEBUG] Property ID:', propertyId);
      
      if (!propertyId) {
        return c.json({ error: 'Property ID is required' }, 400);
      }

      console.log('[DEBUG] About to query database with Supabase');
      
      // Query units with Supabase
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select(`
          *,
          tenant:users!units_tenantId_fkey(
            id,
            firstName,
            lastName,
            email,
            phoneNumber
          ),
          property:properties!units_propertyId_fkey(
            id,
            name
          )
        `)
        .eq('propertyId', propertyId)
        .eq('isActive', true)
        .order('unitNumber', { ascending: true });

      if (unitsError) {
        console.error('Supabase units query error:', unitsError);
        throw new Error(`Database query failed: ${unitsError.message}`);
      }

      console.log('[DEBUG] Database query completed, units found:', units?.length || 0);

      // Transform the data to match frontend expectations
      const transformedUnits = (units || []).map((unit: any) => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        squareFootage: unit.squareFootage,
        monthlyRent: parseFloat(unit.monthlyRent.toString()),
        status: unit.status.toLowerCase(),
        amenities: unit.amenities || [],
        createdAt: unit.createdAt,
        tenant: unit.tenant ? {
          id: unit.tenant.id,
          firstName: unit.tenant.firstName,
          lastName: unit.tenant.lastName,
          email: unit.tenant.email,
          phoneNumber: unit.tenant.phoneNumber || ''
        } : null,
        lastPayment: null, // Will be loaded separately if needed
        openMaintenanceRequests: 0 // Will be loaded separately if needed
      }));

      return c.json({
        success: true,
        data: transformedUnits,
        total: transformedUnits.length
      });

    } catch (error: any) {
      console.error('Error fetching units:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      return c.json({ 
        error: 'Failed to fetch units',
        details: error?.message || 'Unknown error'
      }, 500);
    }
  }

  // Get unit details by ID (single unit)
  static async getUnitDetails(c: Context) {
    try {
      const unitId = c.req.param('unitId');
      
      if (!unitId) {
        return c.json({ error: 'Unit ID is required' }, 400);
      }

      // Query unit with Supabase
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select(`
          *,
          tenant:users!units_tenantId_fkey(
            id,
            firstName,
            lastName,
            email,
            phoneNumber
          )
        `)
        .eq('id', unitId)
        .single();

      if (unitError || !unit) {
        console.error('Supabase unit query error:', unitError);
        return c.json({ error: 'Unit not found' }, 404);
      }

      // Transform to match frontend expectations (simplified for now)
      const unitDetails = {
        lastPayment: null, // Will be loaded separately if needed
        paymentHistory: [], // Will be loaded separately if needed
        maintenanceRequests: [], // Will be loaded separately if needed
        lastMaintenance: null, // Will be loaded separately if needed
        nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      };

      return c.json({
        success: true,
        data: unitDetails
      });

    } catch (error) {
      console.error('Error fetching unit details:', error);
      return c.json({ error: 'Failed to fetch unit details' }, 500);
    }
  }

  // Get bulk unit details by array of IDs
  static async getBulkUnitDetails(c: Context) {
    try {
      const body = await c.req.json();
      const { unitIds } = body;
      
      if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
        return c.json({ error: 'Unit IDs array is required' }, 400);
      }

      // Limit to prevent abuse
      if (unitIds.length > 50) {
        return c.json({ error: 'Maximum 50 units can be requested at once' }, 400);
      }

      // Query units with Supabase
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select(`
          *,
          tenant:users!units_tenantId_fkey(
            id,
            firstName,
            lastName,
            email,
            phoneNumber
          )
        `)
        .in('id', unitIds);

      if (unitsError) {
        console.error('Supabase bulk units query error:', unitsError);
        throw new Error(`Database query failed: ${unitsError.message}`);
      }

      // Transform to match frontend expectations (simplified for now)
      const unitDetailsMap = (units || []).reduce((acc: any, unit: any) => {
        acc[unit.id] = {
          lastPayment: null, // Will be loaded separately if needed
          paymentHistory: [], // Will be loaded separately if needed
          maintenanceRequests: [], // Will be loaded separately if needed
          lastMaintenance: null, // Will be loaded separately if needed
          nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        };
        return acc;
      }, {} as Record<string, any>);

      return c.json({
        success: true,
        data: unitDetailsMap
      });

    } catch (error) {
      console.error('Error fetching bulk unit details:', error);
      return c.json({ error: 'Failed to fetch unit details' }, 500);
    }
  }
} 