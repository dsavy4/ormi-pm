import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';

export class ManagerController {
  /**
   * Get all managers for authenticated user
   */
  async getAll(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      // Get all users with manager roles
      const { data: managers, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          avatar,
          role,
          is_active,
          created_at,
          updated_at
        `)
        .in('role', ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'MAINTENANCE_STAFF', 'ACCOUNTING_STAFF'])
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Managers fetch error:', error);
        return c.json({ error: 'Failed to fetch managers' }, 500);
      }

      // Get property assignments for each manager
      const managersWithAssignments = await Promise.all(
        managers?.map(async (manager) => {
          // Get assigned properties
          const { data: assignedProperties, error: propError } = await supabase
            .from('properties')
            .select('id, name, address, city, state')
            .eq('manager_id', manager.id);

          // Get performance metrics (simplified - would be calculated from real data)
          const { data: properties, error: propertiesError } = await supabase
            .from('properties')
            .select(`
              id,
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
            .eq('manager_id', manager.id);

          // Calculate performance metrics
          const totalUnits = properties?.reduce((sum, prop) => sum + (prop.units?.length || 0), 0) || 0;
          const occupiedUnits = properties?.reduce((sum, prop) => 
            sum + (prop.units?.filter(unit => unit.lease_status === 'LEASED').length || 0), 0) || 0;
          const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

          // Calculate maintenance response time (average time from submitted to in_progress)
          const maintenanceRequests = properties?.flatMap(prop => prop.maintenance_requests || []) || [];
          const completedRequests = maintenanceRequests.filter(req => req.status === 'COMPLETED');
          const avgResponseTime = completedRequests.length > 0 
            ? completedRequests.reduce((sum, req) => {
                const created = new Date(req.created_at);
                const updated = new Date(req.updated_at);
                return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
              }, 0) / completedRequests.length
            : 0;

          // Mock tenant satisfaction (would come from tenant surveys)
          const tenantSatisfaction = Math.random() * 20 + 80; // 80-100 range

          // Mock collection rate (would be calculated from payment data)
          const collectionRate = Math.random() * 10 + 90; // 90-100 range

          // Mock average rating (would come from tenant reviews)
          const avgRating = Math.random() * 1 + 4; // 4-5 range

          // Get recent activity
          const { data: recentActivity, error: activityError } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', manager.id)
            .order('created_at', { ascending: false })
            .limit(5);

          const managerData = {
            id: manager.id,
            firstName: manager.first_name,
            lastName: manager.last_name,
            email: manager.email,
            phone: manager.phone_number || '',
            avatar: manager.avatar,
            role: manager.role,
            status: manager.is_active ? 'Active' : 'Inactive',
            hireDate: manager.created_at,
            assignedProperties: assignedProperties?.length || 0,
            totalProperties: properties?.length || 0,
            performanceMetrics: {
              occupancyRate: Math.round(occupancyRate * 10) / 10,
              maintenanceResponseTime: Math.round(avgResponseTime * 10) / 10,
              tenantSatisfaction: Math.round(tenantSatisfaction * 10) / 10,
              collectionRate: Math.round(collectionRate * 10) / 10,
              avgRating: Math.round(avgRating * 10) / 10,
            },
            recentActivity: recentActivity?.map(activity => ({
              id: activity.id,
              type: this.getActivityType(activity.action),
              description: activity.action,
              timestamp: activity.created_at,
            })) || [],
            contactInfo: {
              email: manager.email,
              phone: manager.phone_number || '',
              address: '', // Would come from manager profile
            },
            certifications: [], // Would come from manager profile
            experience: Math.floor(Math.random() * 10) + 1, // Mock experience
            isActive: manager.is_active,
          };

          return managerData;
        }) || []
      );

      return c.json({ success: true, data: managersWithAssignments });
      
    } catch (error) {
      console.error('Managers fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get manager by ID
   */
  async getById(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const managerId = c.req.param('id');
      
      const { data: manager, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          avatar,
          role,
          is_active,
          created_at,
          updated_at
        `)
        .eq('id', managerId)
        .in('role', ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'MAINTENANCE_STAFF', 'ACCOUNTING_STAFF'])
        .single();
      
      if (error || !manager) {
        return c.json({ error: 'Manager not found' }, 404);
      }

      // Get detailed manager information
      const managerData = await this.getManagerDetails(supabase, manager);
      
      return c.json({ success: true, data: managerData });
      
    } catch (error) {
      console.error('Manager fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Create new manager
   */
  async create(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        role, 
        password
      } = body;

      if (!firstName || !lastName || !email || !role || !password) {
        return c.json({ error: 'First name, last name, email, role, and password are required' }, 400);
      }

      // Store password as plain text (as requested)
      const { data: newManager, error } = await supabase
        .from('users')
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phone,
            password: password, // Plain text as requested
            role: role,
            is_active: true,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Manager creation error:', error);
        return c.json({ error: 'Failed to create manager' }, 500);
      }

      return c.json({ 
        success: true, 
        data: newManager,
        message: 'Manager created successfully'
      });
      
    } catch (error) {
      console.error('Manager creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update manager
   */
  async update(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const managerId = c.req.param('id');
      const body = await c.req.json();
      
      const { firstName, lastName, email, phone, role, isActive } = body;

      const updateData: any = {};
      if (firstName !== undefined) updateData.first_name = firstName;
      if (lastName !== undefined) updateData.last_name = lastName;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone_number = phone;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.is_active = isActive;
      updateData.updated_at = new Date().toISOString();

      const { data: updatedManager, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', managerId)
        .select()
        .single();

      if (error) {
        console.error('Manager update error:', error);
        return c.json({ error: 'Failed to update manager' }, 500);
      }

      return c.json({ 
        success: true, 
        data: updatedManager,
        message: 'Manager updated successfully'
      });
      
    } catch (error) {
      console.error('Manager update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Delete/deactivate manager
   */
  async delete(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const managerId = c.req.param('id');
      
      // Soft delete - set is_active to false
      const { data: deactivatedManager, error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', managerId)
        .select()
        .single();

      if (error) {
        console.error('Manager deactivation error:', error);
        return c.json({ error: 'Failed to deactivate manager' }, 500);
      }

      return c.json({ 
        success: true, 
        data: deactivatedManager,
        message: 'Manager deactivated successfully'
      });
      
    } catch (error) {
      console.error('Manager deactivation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Assign properties to manager
   */
  async assignProperties(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const managerId = c.req.param('id');
      const body = await c.req.json();
      
      const { propertyIds } = body;

      if (!propertyIds || !Array.isArray(propertyIds)) {
        return c.json({ error: 'Property IDs array is required' }, 400);
      }

      // Update properties to assign them to the manager
      const { data: updatedProperties, error } = await supabase
        .from('properties')
        .update({ 
          manager_id: managerId,
          updated_at: new Date().toISOString()
        })
        .in('id', propertyIds)
        .select();

      if (error) {
        console.error('Property assignment error:', error);
        return c.json({ error: 'Failed to assign properties' }, 500);
      }

      return c.json({ 
        success: true, 
        data: updatedProperties,
        message: `${updatedProperties?.length || 0} properties assigned successfully`
      });
      
    } catch (error) {
      console.error('Property assignment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get manager performance analytics
   */
  async getPerformance(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const managerId = c.req.param('id');
      
      // Get manager's properties and calculate performance metrics
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
            priority,
            created_at,
            updated_at
          ),
          payments (
            id,
            amount,
            status,
            due_date,
            payment_date
          )
        `)
        .eq('manager_id', managerId);

      if (error) {
        console.error('Performance fetch error:', error);
        return c.json({ error: 'Failed to fetch performance data' }, 500);
      }

      // Calculate comprehensive performance metrics
      const performanceData = this.calculatePerformanceMetrics(properties || []);

      return c.json({ success: true, data: performanceData });
      
    } catch (error) {
      console.error('Performance fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Helper method to get detailed manager information
   */
  private async getManagerDetails(supabase: any, manager: any) {
    // Get assigned properties
    const { data: assignedProperties } = await supabase
      .from('properties')
      .select('id, name, address, city, state')
      .eq('manager_id', manager.id);

    // Get performance metrics
    const { data: properties } = await supabase
      .from('properties')
      .select(`
        id,
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
      .eq('manager_id', manager.id);

    const totalUnits = properties?.reduce((sum, prop) => sum + (prop.units?.length || 0), 0) || 0;
    const occupiedUnits = properties?.reduce((sum, prop) => 
      sum + (prop.units?.filter(unit => unit.lease_status === 'LEASED').length || 0), 0) || 0;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      id: manager.id,
      firstName: manager.first_name,
      lastName: manager.last_name,
      email: manager.email,
      phone: manager.phone_number || '',
      avatar: manager.avatar,
      role: manager.role,
      status: manager.is_active ? 'Active' : 'Inactive',
      hireDate: manager.created_at,
      assignedProperties: assignedProperties?.length || 0,
      totalProperties: properties?.length || 0,
      performanceMetrics: {
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        maintenanceResponseTime: Math.round((Math.random() * 24 + 4) * 10) / 10, // 4-28 hours
        tenantSatisfaction: Math.round((Math.random() * 20 + 80) * 10) / 10, // 80-100
        collectionRate: Math.round((Math.random() * 10 + 90) * 10) / 10, // 90-100
        avgRating: Math.round((Math.random() * 1 + 4) * 10) / 10, // 4-5
      },
      recentActivity: [],
      contactInfo: {
        email: manager.email,
        phone: manager.phone_number || '',
        address: '',
      },
      certifications: [],
      experience: Math.floor(Math.random() * 10) + 1,
      isActive: manager.is_active,
    };
  }

  /**
   * Helper method to calculate performance metrics
   */
  private calculatePerformanceMetrics(properties: any[]) {
    const totalUnits = properties.reduce((sum, prop) => sum + (prop.units?.length || 0), 0);
    const occupiedUnits = properties.reduce((sum, prop) => 
      sum + (prop.units?.filter(unit => unit.lease_status === 'LEASED').length || 0), 0);
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    const maintenanceRequests = properties.flatMap(prop => prop.maintenance_requests || []);
    const completedRequests = maintenanceRequests.filter(req => req.status === 'COMPLETED');
    const urgentRequests = maintenanceRequests.filter(req => req.priority === 'URGENT');

    const payments = properties.flatMap(prop => prop.payments || []);
    const paidPayments = payments.filter(payment => payment.status === 'PAID');
    const collectionRate = payments.length > 0 ? (paidPayments.length / payments.length) * 100 : 0;

    return {
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      totalUnits,
      occupiedUnits,
      maintenanceRequests: maintenanceRequests.length,
      completedRequests: completedRequests.length,
      urgentRequests: urgentRequests.length,
      collectionRate: Math.round(collectionRate * 10) / 10,
      totalPayments: payments.length,
      paidPayments: paidPayments.length,
      properties: properties.length,
    };
  }

  /**
   * Helper method to get activity type from action
   */
  private getActivityType(action: string): string {
    if (action.includes('maintenance')) return 'maintenance';
    if (action.includes('payment')) return 'payment';
    if (action.includes('tenant')) return 'tenant';
    if (action.includes('property')) return 'property';
    return 'general';
  }
} 