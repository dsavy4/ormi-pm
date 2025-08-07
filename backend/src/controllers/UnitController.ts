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

      // Get query parameters
                        const page = parseInt(c.req.query('page') || '1');
                  const limit = parseInt(c.req.query('limit') || '20');
                  const search = c.req.query('search') || '';
                  const status = c.req.query('status') || '';
                  const occupancy = c.req.query('occupancy') || '';
                  const bedrooms = c.req.query('bedrooms') || '';
                  const bedroomsMin = c.req.query('bedroomsMin') || '';
                  const bedroomsMax = c.req.query('bedroomsMax') || '';
                  const floor = c.req.query('floor') || '';
                  const sortBy = c.req.query('sortBy') || 'unitNumber';
                  const sortOrder = c.req.query('sortOrder') || 'asc';
      
      // Get property info to determine loading strategy
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('totalUnits')
        .eq('id', propertyId)
        .single();
      
      if (propertyError) {
        console.error('Property query error:', propertyError);
        throw new Error(`Property not found: ${propertyError.message}`);
      }

      const totalUnits = property?.totalUnits || 0;
      const useProgressiveLoading = totalUnits < 500;
      const actualLimit = useProgressiveLoading ? 50 : limit;
      const offset = (page - 1) * actualLimit;

      console.log(`[DEBUG] Property has ${totalUnits} units, using ${useProgressiveLoading ? 'progressive' : 'pagination'} loading`);
      console.log(`[DEBUG] Query params - Page: ${page}, Limit: ${actualLimit}, Offset: ${offset}, Search: "${search}", Status: "${status}"`);

      // Build query
      let query = supabase
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
        `, { count: 'exact' })
        .eq('propertyId', propertyId)
        .eq('isActive', true);

                        // Add filters
                  if (search) {
                    query = query.or(`unitNumber.ilike.%${search}%,tenant.firstName.ilike.%${search}%,tenant.lastName.ilike.%${search}%`);
                  }

                  if (status && status !== 'all') {
                    query = query.eq('status', status.toUpperCase());
                  }

                  if (occupancy && occupancy !== 'all') {
                    if (occupancy === 'occupied') {
                      query = query.not('tenantId', 'is', null);
                    } else if (occupancy === 'vacant') {
                      query = query.is('tenantId', null);
                    }
                  }

                  if (bedrooms && bedrooms !== 'all') {
                    if (bedrooms === '4') {
                      query = query.gte('bedrooms', 4);
                    } else {
                      query = query.eq('bedrooms', parseInt(bedrooms));
                    }
                  }

                  // Handle custom bedroom range
                  if (bedroomsMin && bedroomsMin !== '') {
                    query = query.gte('bedrooms', parseInt(bedroomsMin));
                  }
                  if (bedroomsMax && bedroomsMax !== '') {
                    query = query.lte('bedrooms', parseInt(bedroomsMax));
                  }

                  if (floor && floor !== 'all') {
                    query = query.eq('floor', parseInt(floor));
                  }

      // Add sorting
      if (sortBy === 'unitNumber') {
        query = query.order('unitNumber', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'monthlyRent') {
        query = query.order('monthlyRent', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'status') {
        query = query.order('status', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order('unitNumber', { ascending: true });
      }

      // Add pagination
      query = query.range(offset, offset + actualLimit - 1);

      const { data: units, error: unitsError, count } = await query;

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

      const totalPages = Math.ceil((count || 0) / actualLimit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return c.json({
        success: true,
        data: transformedUnits,
        loadingStrategy: useProgressiveLoading ? 'progressive' : 'pagination',
        propertyInfo: {
          totalUnits,
          useProgressiveLoading
        },
        pagination: {
          page,
          limit: actualLimit,
          total: count || 0,
          totalPages,
          hasNextPage,
          hasPrevPage,
          showing: `${offset + 1}-${Math.min(offset + actualLimit, count || 0)} of ${count || 0} units`,
          hasMoreUnits: useProgressiveLoading ? hasNextPage : false
        }
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