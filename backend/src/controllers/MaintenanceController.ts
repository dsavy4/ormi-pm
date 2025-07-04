import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';

export class MaintenanceController {
  /**
   * Get all maintenance requests for authenticated user
   */
  async getAll(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const status = c.req.query('status');
      const priority = c.req.query('priority');
      const propertyId = c.req.query('propertyId');
      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);
      
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenant:users!maintenance_requests_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          unit:units!maintenance_requests_unit_id_fkey (
            id,
            unit_number,
            property:properties!units_property_id_fkey (
              id,
              name,
              address,
              city,
              state,
              owner_id
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (priority) {
        query = query.eq('priority', priority);
      }
      
      const { data: maintenanceRequests, error } = await query
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) {
        console.error('Maintenance requests fetch error:', error);
        return c.json({ error: 'Failed to fetch maintenance requests' }, 500);
      }
      
      // Filter to only include requests from properties owned by the user
      const filteredRequests = maintenanceRequests?.filter((request: any) => 
        request.unit.property.owner_id === user.userId &&
        (!propertyId || request.unit.property.id === propertyId)
      ) || [];
      
      return c.json(filteredRequests);
      
    } catch (error) {
      console.error('Maintenance requests fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get maintenance request by ID
   */
  async getById(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const requestId = c.req.param('id');
      
      const { data: request, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenant:users!maintenance_requests_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          unit:units!maintenance_requests_unit_id_fkey (
            id,
            unit_number,
            monthly_rent,
            property:properties!units_property_id_fkey (
              id,
              name,
              address,
              city,
              state,
              owner_id
            )
          ),
          comments:maintenance_comments (
            id,
            content,
            created_at,
            user_id
          )
        `)
        .eq('id', requestId)
        .single();
      
      if (error || !request) {
        return c.json({ error: 'Maintenance request not found' }, 404);
      }
      
      // Verify user owns the property
      if (request.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      return c.json(request);
      
    } catch (error) {
      console.error('Maintenance request fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Create new maintenance request
   */
  async create(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      const { 
        unitId, 
        tenantId, 
        title, 
        description, 
        priority = 'MEDIUM',
        images = []
      } = body;
      
      if (!unitId || !tenantId || !title || !description) {
        return c.json({ error: 'Unit ID, tenant ID, title, and description are required' }, 400);
      }
      
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
      
      const { data: maintenanceRequest, error } = await supabase
        .from('maintenance_requests')
        .insert([
          {
            unit_id: unitId,
            tenant_id: tenantId,
            title: title,
            description: description,
            priority: priority,
            status: 'SUBMITTED',
            images: images
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Maintenance request creation error:', error);
        return c.json({ error: 'Failed to create maintenance request' }, 500);
      }
      
      return c.json(maintenanceRequest);
      
    } catch (error) {
      console.error('Maintenance request creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update maintenance request
   */
  async update(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const requestId = c.req.param('id');
      const body = await c.req.json();
      
      // Verify user owns the property
      const { data: request, error: requestError } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          unit:units!maintenance_requests_unit_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', requestId)
        .single();
      
      if (requestError || !request || request.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Maintenance request not found or access denied' }, 404);
      }
      
      const { 
        title, 
        description, 
        priority, 
        status,
        assignedTo,
        notes,
        images 
      } = body;
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) updateData.status = status;
      if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
      if (notes !== undefined) updateData.notes = notes;
      if (images !== undefined) updateData.images = images;
      
      const { data: updatedRequest, error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) {
        console.error('Maintenance request update error:', error);
        return c.json({ error: 'Failed to update maintenance request' }, 500);
      }
      
      return c.json(updatedRequest);
      
    } catch (error) {
      console.error('Maintenance request update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Delete maintenance request
   */
  async delete(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const requestId = c.req.param('id');
      
      // Verify user owns the property
      const { data: request, error: requestError } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          status,
          unit:units!maintenance_requests_unit_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', requestId)
        .single();
      
      if (requestError || !request || request.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Maintenance request not found or access denied' }, 404);
      }
      
      // Don't allow deletion of in-progress requests
      if (request.status === 'IN_PROGRESS') {
        return c.json({ error: 'Cannot delete in-progress maintenance request' }, 400);
      }
      
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', requestId);
      
      if (error) {
        console.error('Maintenance request deletion error:', error);
        return c.json({ error: 'Failed to delete maintenance request' }, 500);
      }
      
      return c.json({ message: 'Maintenance request deleted successfully' });
      
    } catch (error) {
      console.error('Maintenance request deletion error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Add comment to maintenance request
   */
  async addComment(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const requestId = c.req.param('id');
      const body = await c.req.json();
      
      const { content } = body;
      
      if (!content) {
        return c.json({ error: 'Comment content is required' }, 400);
      }
      
      // Verify user owns the property
      const { data: request, error: requestError } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          unit:units!maintenance_requests_unit_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', requestId)
        .single();
      
      if (requestError || !request || request.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Maintenance request not found or access denied' }, 404);
      }
      
      const { data: comment, error } = await supabase
        .from('maintenance_comments')
        .insert([
          {
            request_id: requestId,
            user_id: user.userId,
            content: content
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Comment creation error:', error);
        return c.json({ error: 'Failed to add comment' }, 500);
      }
      
      return c.json(comment);
      
    } catch (error) {
      console.error('Comment creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get maintenance request comments
   */
  async getComments(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const requestId = c.req.param('id');
      
      // Verify user owns the property
      const { data: request, error: requestError } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          unit:units!maintenance_requests_unit_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', requestId)
        .single();
      
      if (requestError || !request || request.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Maintenance request not found or access denied' }, 404);
      }
      
      const { data: comments, error } = await supabase
        .from('maintenance_comments')
        .select(`
          *,
          user:users!maintenance_comments_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Comments fetch error:', error);
        return c.json({ error: 'Failed to fetch comments' }, 500);
      }
      
      return c.json(comments || []);
      
    } catch (error) {
      console.error('Comments fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get maintenance request summary/analytics
   */
  async getSummary(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.query('propertyId');
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');
      
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          unit:units!maintenance_requests_unit_id_fkey (
            property:properties!units_property_id_fkey (
              id,
              name,
              owner_id
            )
          )
        `);
      
      // Apply date filters
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      const { data: requests, error } = await query;
      
      if (error) {
        console.error('Maintenance summary fetch error:', error);
        return c.json({ error: 'Failed to fetch maintenance summary' }, 500);
      }
      
      // Filter to only include requests from properties owned by the user
      const filteredRequests = requests?.filter((request: any) => 
        request.unit.property.owner_id === user.userId &&
        (!propertyId || request.unit.property.id === propertyId)
      ) || [];
      
      // Calculate summary statistics
      const totalRequests = filteredRequests.length;
      const openRequests = filteredRequests.filter((r: any) => 
        ['SUBMITTED', 'IN_PROGRESS'].includes(r.status)
      ).length;
      const completedRequests = filteredRequests.filter((r: any) => 
        r.status === 'COMPLETED'
      ).length;
      
      const summary = {
        totalRequests,
        openRequests,
        completedRequests,
        completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
        requestsByStatus: {
          SUBMITTED: filteredRequests.filter((r: any) => r.status === 'SUBMITTED').length,
          IN_PROGRESS: filteredRequests.filter((r: any) => r.status === 'IN_PROGRESS').length,
          COMPLETED: filteredRequests.filter((r: any) => r.status === 'COMPLETED').length,
          REJECTED: filteredRequests.filter((r: any) => r.status === 'REJECTED').length,
          CANCELLED: filteredRequests.filter((r: any) => r.status === 'CANCELLED').length
        },
        requestsByPriority: {
          LOW: filteredRequests.filter((r: any) => r.priority === 'LOW').length,
          MEDIUM: filteredRequests.filter((r: any) => r.priority === 'MEDIUM').length,
          HIGH: filteredRequests.filter((r: any) => r.priority === 'HIGH').length,
          URGENT: filteredRequests.filter((r: any) => r.priority === 'URGENT').length
        }
      };
      
      return c.json(summary);
      
    } catch (error) {
      console.error('Maintenance summary error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update maintenance request status
   */
  async updateStatus(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const requestId = c.req.param('id');
      const body = await c.req.json();
      
      const { status, notes } = body;
      
      if (!status) {
        return c.json({ error: 'Status is required' }, 400);
      }
      
      // Verify user owns the property
      const { data: request, error: requestError } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          unit:units!maintenance_requests_unit_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', requestId)
        .single();
      
      if (requestError || !request || request.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Maintenance request not found or access denied' }, 404);
      }
      
      const updateData: any = { status };
      if (notes !== undefined) updateData.notes = notes;
      
      const { data: updatedRequest, error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) {
        console.error('Status update error:', error);
        return c.json({ error: 'Failed to update status' }, 500);
      }
      
      return c.json(updatedRequest);
      
    } catch (error) {
      console.error('Status update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}

export const maintenanceController = new MaintenanceController(); 