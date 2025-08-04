import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';
import { storageService } from '../utils/storage';

export class TeamMemberController {
  /**
   * Get all team members for authenticated user
   */
  async getAll(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      // Get all users with team member roles
      const { data: teamMembers, error } = await supabase
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
          updated_at,
          bio,
          address,
          emergency_contact_name,
          emergency_contact_phone,
          department,
          hire_date,
          salary,
          employment_status,
          access_level,
          can_manage_properties,
          can_manage_tenants,
          can_manage_maintenance,
          can_view_reports
        `)
        .in('role', ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'MAINTENANCE_STAFF', 'ACCOUNTING_STAFF', 'LEASING_AGENT', 'REGIONAL_MANAGER', 'SENIOR_MANAGER'])
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Team members fetch error:', error);
        return c.json({ error: 'Failed to fetch team members' }, 500);
      }

      // Get property assignments for each team member
      const teamMembersWithAssignments = await Promise.all(
        teamMembers?.map(async (teamMember) => {
          // Get assigned properties
          const { data: assignedProperties, error: propError } = await supabase
            .from('properties')
            .select('id, name, address, city, state')
            .eq('manager_id', teamMember.id);

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
            .eq('manager_id', teamMember.id);

          // Calculate performance metrics
          const totalUnits = properties?.reduce((sum: number, prop: any) => sum + (prop.units?.length || 0), 0) || 0;
          const occupiedUnits = properties?.reduce((sum: number, prop: any) => 
            sum + (prop.units?.filter((unit: any) => unit.lease_status === 'LEASED').length || 0), 0) || 0;
          const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

          // Calculate maintenance response time (average time from submitted to in_progress)
          const maintenanceRequests = properties?.flatMap((prop: any) => prop.maintenance_requests || []) || [];
          const completedRequests = maintenanceRequests.filter((req: any) => req.status === 'COMPLETED');
          const avgResponseTime = completedRequests.length > 0 
            ? completedRequests.reduce((sum: number, req: any) => {
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
            .eq('user_id', teamMember.id)
            .order('created_at', { ascending: false })
            .limit(5);

          const teamMemberData = {
            id: teamMember.id,
            firstName: teamMember.first_name,
            lastName: teamMember.last_name,
            email: teamMember.email,
            phone: teamMember.phone_number || '',
            avatar: teamMember.avatar,
            role: teamMember.role,
            status: teamMember.is_active ? 'Active' : 'Inactive',
            hireDate: teamMember.created_at,
            assignedProperties: assignedProperties?.length || 0,
            totalProperties: properties?.length || 0,
            performanceMetrics: {
              occupancyRate: Math.round((occupancyRate || 0) * 10) / 10,
              maintenanceResponseTime: Math.round((avgResponseTime || 0) * 10) / 10,
              tenantSatisfaction: Math.round((tenantSatisfaction || 0) * 10) / 10,
              collectionRate: Math.round((collectionRate || 0) * 10) / 10,
              avgRating: Math.round((avgRating || 0) * 10) / 10,
            },
            recentActivity: recentActivity?.map(activity => ({
              id: activity.id,
              type: this.getActivityType(activity.action),
              description: activity.action,
              timestamp: activity.created_at,
            })) || [],
            contactInfo: {
              email: teamMember.email,
              phone: teamMember.phone_number || '',
              address: '', // Would come from team member profile
            },
            certifications: [], // Would come from team member profile
            experience: Math.floor(Math.random() * 10) + 1, // Mock experience
            isActive: teamMember.is_active,
          };

          return teamMemberData;
        }) || []
      );

      return c.json({ success: true, data: teamMembersWithAssignments });
      
    } catch (error) {
      console.error('Team members fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get team member by ID
   */
  async getById(c: Context) {
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

      // Get detailed team member information
      const detailedTeamMember = await this.getTeamMemberDetails(supabase, teamMember);
      
      return c.json({ success: true, data: detailedTeamMember });
    } catch (error) {
      console.error('Team member fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Create new team member
   */
  async create(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const body = await c.req.json();
      
      // Validate required fields
      if (!body.email || !body.firstName || !body.lastName) {
        return c.json({ error: 'Email, first name, and last name are required' }, 400);
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', body.email)
        .single();

      if (existingUser) {
        return c.json({ error: 'Email already exists' }, 400);
      }

      // Create team member
      const { data: teamMember, error } = await supabase
        .from('users')
        .insert({
          email: body.email,
          first_name: body.firstName,
          last_name: body.lastName,
          phone_number: body.phoneNumber,
          password: body.password || 'defaultpassword123',
          role: body.role || 'PROPERTY_MANAGER',
          is_active: true,
          email_verified: false,
          bio: body.bio,
          department: body.department,
          hire_date: body.hireDate,
          salary: body.salary,
          employment_status: body.employmentStatus,
          access_level: body.accessLevel || 'Basic',
          can_manage_properties: body.canManageProperties || false,
          can_manage_tenants: body.canManageTenants || false,
          can_manage_maintenance: body.canManageMaintenance || false,
          can_view_reports: body.canViewReports || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Team member creation error:', error);
        return c.json({ error: 'Failed to create team member' }, 500);
      }

      return c.json({ success: true, data: teamMember });
    } catch (error) {
      console.error('Team member creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update team member
   */
  async update(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const teamMemberId = c.req.param('id');
      const body = await c.req.json();
      
      // Check if team member exists
      const { data: existingTeamMember } = await supabase
        .from('users')
        .select('id')
        .eq('id', teamMemberId)
        .single();

      if (!existingTeamMember) {
        return c.json({ error: 'Team member not found' }, 404);
      }

      // Update team member
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
        console.error('Team member update error:', error);
        return c.json({ error: 'Failed to update team member' }, 500);
      }

      return c.json({ success: true, data: teamMember });
    } catch (error) {
      console.error('Team member update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Delete/deactivate team member
   */
  async delete(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const teamMemberId = c.req.param('id');
      
      // Soft delete by setting is_active to false
      const { data: teamMember, error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', teamMemberId)
        .select()
        .single();

      if (error) {
        console.error('Team member deletion error:', error);
        return c.json({ error: 'Failed to delete team member' }, 500);
      }

      return c.json({ success: true, data: teamMember });
    } catch (error) {
      console.error('Team member deletion error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Assign properties to team member
   */
  async assignProperties(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const teamMemberId = c.req.param('id');
      const body = await c.req.json();
      
      if (!body.propertyIds || !Array.isArray(body.propertyIds)) {
        return c.json({ error: 'Property IDs array is required' }, 400);
      }

      // Update properties to assign them to the team member
      const { error } = await supabase
        .from('properties')
        .update({ manager_id: teamMemberId })
        .in('id', body.propertyIds);

      if (error) {
        console.error('Property assignment error:', error);
        return c.json({ error: 'Failed to assign properties' }, 500);
      }

      return c.json({ success: true, message: 'Properties assigned successfully' });
    } catch (error) {
      console.error('Property assignment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get team member performance analytics
   */
  async getPerformance(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const teamMemberId = c.req.param('id');
      
      // Get team member's properties
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
        console.error('Performance fetch error:', error);
        return c.json({ error: 'Failed to fetch performance data' }, 500);
      }

      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(properties || []);
      
      return c.json({ success: true, data: performanceMetrics });
    } catch (error) {
      console.error('Performance fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Upload team member avatar
   */
  async uploadAvatar(c: Context) {
    try {
      const teamMemberId = c.req.param('id');
      const formData = await c.req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return c.json({ error: 'No file provided' }, 400);
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Upload to R2
      const { url, key } = await storageService.uploadTeamMemberAvatar(
        buffer,
        file.name,
        file.type,
        teamMemberId
      );

      // Update team member's avatar URL
      const supabase = getSupabaseClient(c.env);
      const { error } = await supabase
        .from('users')
        .update({ avatar: url })
        .eq('id', teamMemberId);

      if (error) {
        console.error('Avatar update error:', error);
        return c.json({ error: 'Failed to update avatar' }, 500);
      }

      return c.json({ success: true, data: { url, key } });
    } catch (error) {
      console.error('Avatar upload error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Generate presigned URL for avatar upload
   */
  async generateAvatarUploadUrl(c: Context) {
    try {
      const teamMemberId = c.req.param('id');
      const body = await c.req.json();
      
      if (!body.fileName || !body.contentType) {
        return c.json({ error: 'File name and content type are required' }, 400);
      }

      // Generate presigned URL
      const { uploadUrl, key, publicUrl } = await storageService.generateTeamMemberAvatarUploadUrl(
        body.fileName,
        body.contentType,
        teamMemberId
      );

      return c.json({ success: true, data: { uploadUrl, key, publicUrl } });
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Bulk assign properties to team members
   */
  async bulkAssignProperties(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const body = await c.req.json();
      
      if (!body.assignments || !Array.isArray(body.assignments)) {
        return c.json({ error: 'Assignments array is required' }, 400);
      }

      // Process each assignment
      for (const assignment of body.assignments) {
        const { teamMemberId, propertyIds } = assignment;
        
        if (teamMemberId && propertyIds && Array.isArray(propertyIds)) {
          await supabase
            .from('properties')
            .update({ manager_id: teamMemberId })
            .in('id', propertyIds);
        }
      }

      return c.json({ success: true, message: 'Properties assigned successfully' });
    } catch (error) {
      console.error('Bulk assignment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Bulk update team member status
   */
  async bulkUpdateStatus(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const body = await c.req.json();
      
      if (!body.teamMemberIds || !Array.isArray(body.teamMemberIds) || body.status === undefined) {
        return c.json({ error: 'Team member IDs array and status are required' }, 400);
      }

      const { error } = await supabase
        .from('users')
        .update({ is_active: body.status })
        .in('id', body.teamMemberIds);

      if (error) {
        console.error('Bulk status update error:', error);
        return c.json({ error: 'Failed to update status' }, 500);
      }

      return c.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
      console.error('Bulk status update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Bulk update team member role
   */
  async bulkUpdateRole(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const body = await c.req.json();
      
      if (!body.teamMemberIds || !Array.isArray(body.teamMemberIds) || !body.role) {
        return c.json({ error: 'Team member IDs array and role are required' }, 400);
      }

      const { error } = await supabase
        .from('users')
        .update({ role: body.role })
        .in('id', body.teamMemberIds);

      if (error) {
        console.error('Bulk role update error:', error);
        return c.json({ error: 'Failed to update role' }, 500);
      }

      return c.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
      console.error('Bulk role update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Import team members from CSV/Excel
   */
  async importTeamMembers(c: Context) {
    try {
      const formData = await c.req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return c.json({ error: 'No file provided' }, 400);
      }

      // TODO: Implement CSV/Excel parsing and team member import
      // This would parse the file and create team members in batch
      
      return c.json({ success: true, message: 'Team members imported successfully' });
    } catch (error) {
      console.error('Team member import error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Export team members to CSV/Excel
   */
  async exportTeamMembers(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const format = c.req.query('format') || 'csv';
      
      // Get all team members
      const { data: teamMembers, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'MAINTENANCE_STAFF', 'ACCOUNTING_STAFF', 'LEASING_AGENT', 'REGIONAL_MANAGER', 'SENIOR_MANAGER']);

      if (error) {
        console.error('Export error:', error);
        return c.json({ error: 'Failed to fetch team members' }, 500);
      }

      // TODO: Implement CSV/Excel generation
      // This would convert the data to the requested format
      
      return c.json({ success: true, data: teamMembers });
    } catch (error) {
      console.error('Team member export error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get team analytics overview
   */
  async getTeamAnalytics(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      
      // Get team member counts by role
      const { data: teamMembers, error } = await supabase
        .from('users')
        .select('role, is_active')
        .in('role', ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'MAINTENANCE_STAFF', 'ACCOUNTING_STAFF', 'LEASING_AGENT', 'REGIONAL_MANAGER', 'SENIOR_MANAGER']);

      if (error) {
        console.error('Analytics error:', error);
        return c.json({ error: 'Failed to fetch analytics' }, 500);
      }

      // Calculate analytics
      const analytics = {
        totalTeamMembers: teamMembers?.length || 0,
        activeTeamMembers: teamMembers?.filter(tm => tm.is_active).length || 0,
        roleDistribution: teamMembers?.reduce((acc: any, tm) => {
          acc[tm.role] = (acc[tm.role] || 0) + 1;
          return acc;
        }, {}) || {},
      };

      return c.json({ success: true, data: analytics });
    } catch (error) {
      console.error('Analytics error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      
      // Get all properties with their managers
      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          id,
          manager_id,
          units (
            id,
            lease_status
          )
        `);

      if (error) {
        console.error('Performance analytics error:', error);
        return c.json({ error: 'Failed to fetch performance data' }, 500);
      }

      // Calculate performance metrics by team member
      const performanceByTeamMember = properties?.reduce((acc: any, prop) => {
        if (prop.manager_id) {
          if (!acc[prop.manager_id]) {
            acc[prop.manager_id] = {
              totalProperties: 0,
              totalUnits: 0,
              occupiedUnits: 0,
            };
          }
          
          acc[prop.manager_id].totalProperties++;
          acc[prop.manager_id].totalUnits += prop.units?.length || 0;
          acc[prop.manager_id].occupiedUnits += prop.units?.filter((unit: any) => unit.lease_status === 'LEASED').length || 0;
        }
        return acc;
      }, {});

      return c.json({ success: true, data: performanceByTeamMember });
    } catch (error) {
      console.error('Performance analytics error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get storage analytics for team members
   */
  async getStorageAnalytics(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      // Get account ID from user
      const accountId = user.account_id || user.id;

      // Mock storage analytics data (in production, this would query R2 storage)
      const storageAnalytics = {
        accountId,
        totalStorage: 1024 * 1024 * 1024 * 2.5, // 2.5 GB
        storageBreakdown: {
          teamMembers: 1024 * 1024 * 512, // 512 MB
          properties: 1024 * 1024 * 1024, // 1 GB
          tenants: 1024 * 1024 * 256, // 256 MB
          maintenance: 1024 * 1024 * 128, // 128 MB
          financial: 1024 * 1024 * 256, // 256 MB
          marketing: 1024 * 1024 * 64, // 64 MB
          legal: 1024 * 1024 * 128, // 128 MB
          templates: 1024 * 1024 * 64, // 64 MB
          shared: 1024 * 1024 * 128, // 128 MB
        },
        fileCounts: {
          total: 1250,
          byType: {
            'image/jpeg': 450,
            'image/png': 200,
            'application/pdf': 300,
            'application/msword': 150,
            'text/csv': 50,
            'other': 100,
          },
          byCategory: {
            teamMembers: 200,
            properties: 400,
            tenants: 150,
            maintenance: 100,
            financial: 200,
            marketing: 50,
            legal: 100,
            templates: 25,
            shared: 25,
          },
        },
        billingTier: 'professional' as const,
        storageLimit: 1024 * 1024 * 1024 * 10, // 10 GB
        overageAmount: 0,
        estimatedCost: 29.99,
      };

      return c.json({
        success: true,
        data: storageAnalytics
      });
    } catch (error) {
      console.error('Storage analytics error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get team templates
   */
  async getTemplates(c: Context) {
    try {
      // TODO: Implement team templates
      // This would return predefined templates for different team member roles
      
      const templates = [
        {
          id: 'property-manager',
          name: 'Property Manager',
          description: 'Full property management access',
          role: 'PROPERTY_MANAGER',
          permissions: {
            canManageProperties: true,
            canManageTenants: true,
            canManageMaintenance: true,
            canViewReports: true,
          },
        },
        {
          id: 'assistant-manager',
          name: 'Assistant Manager',
          description: 'Limited property management access',
          role: 'ASSISTANT_MANAGER',
          permissions: {
            canManageProperties: false,
            canManageTenants: true,
            canManageMaintenance: true,
            canViewReports: false,
          },
        },
      ];

      return c.json({ success: true, data: templates });
    } catch (error) {
      console.error('Templates error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Create team template
   */
  async createTemplate(c: Context) {
    try {
      const body = await c.req.json();
      
      // TODO: Implement template creation
      // This would save a new template to the database
      
      return c.json({ success: true, message: 'Template created successfully' });
    } catch (error) {
      console.error('Template creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update team template
   */
  async updateTemplate(c: Context) {
    try {
      const templateId = c.req.param('id');
      const body = await c.req.json();
      
      // TODO: Implement template update
      // This would update an existing template
      
      return c.json({ success: true, message: 'Template updated successfully' });
    } catch (error) {
      console.error('Template update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Delete team template
   */
  async deleteTemplate(c: Context) {
    try {
      const templateId = c.req.param('id');
      
      // TODO: Implement template deletion
      // This would delete a template
      
      return c.json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Template deletion error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get detailed team member information
   */
  private async getTeamMemberDetails(supabase: any, teamMember: any) {
    // Get assigned properties
    const { data: assignedProperties } = await supabase
      .from('properties')
      .select('id, name, address, city, state')
      .eq('manager_id', teamMember.id);

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
      .eq('manager_id', teamMember.id);

    const performanceMetrics = this.calculatePerformanceMetrics(properties || []);

    return {
      ...teamMember,
      assignedProperties: assignedProperties || [],
      performanceMetrics,
    };
  }

  /**
   * Calculate performance metrics for properties
   */
  private calculatePerformanceMetrics(properties: any[]) {
    const totalUnits = properties.reduce((sum, prop) => sum + (prop.units?.length || 0), 0);
    const occupiedUnits = properties.reduce((sum, prop) => 
      sum + (prop.units?.filter((unit: any) => unit.lease_status === 'LEASED').length || 0), 0);
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    const maintenanceRequests = properties.flatMap(prop => prop.maintenance_requests || []);
    const completedRequests = maintenanceRequests.filter((req: any) => req.status === 'COMPLETED');
    const avgResponseTime = completedRequests.length > 0 
      ? completedRequests.reduce((sum: number, req: any) => {
          const created = new Date(req.created_at);
          const updated = new Date(req.updated_at);
          return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        }, 0) / completedRequests.length
      : 0;

    return {
      totalProperties: properties.length,
      totalUnits,
      occupiedUnits,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    };
  }

  /**
   * Get activity type from action
   */
  private getActivityType(action: string): string {
    if (action.includes('property')) return 'property';
    if (action.includes('tenant')) return 'tenant';
    if (action.includes('maintenance')) return 'maintenance';
    if (action.includes('payment')) return 'payment';
    return 'general';
  }
} 