import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';

export class ReportsController {
  /**
   * Get rent roll report
   */
  async getRentRoll(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.query('propertyId');
      const date = c.req.query('date') || new Date().toISOString().split('T')[0];
      
      let query = supabase
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
            city,
            state,
            owner_id
          ),
          payments (
            id,
            amount,
            due_date,
            status,
            payment_date
          )
        `)
        .eq('property.owner_id', user.userId)
        .order('property.name')
        .order('unit_number');
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data: units, error } = await query;
      
      if (error) {
        console.error('Rent roll fetch error:', error);
        return c.json({ error: 'Failed to fetch rent roll' }, 500);
      }
      
      // Filter to only include units from properties owned by the user
      const filteredUnits = units?.filter((unit: any) => 
        unit.property.owner_id === user.userId
      ) || [];
      
      // Calculate totals
      const totalUnits = filteredUnits.length;
      const occupiedUnits = filteredUnits.filter((unit: any) => 
        unit.lease_status === 'LEASED'
      ).length;
      const vacantUnits = totalUnits - occupiedUnits;
      const totalRent = filteredUnits.reduce((sum: number, unit: any) => 
        sum + parseFloat(unit.monthly_rent), 0
      );
      const occupiedRent = filteredUnits
        .filter((unit: any) => unit.lease_status === 'LEASED')
        .reduce((sum: number, unit: any) => sum + parseFloat(unit.monthly_rent), 0);
      const vacantRent = totalRent - occupiedRent;
      
      const report = {
        reportDate: date,
        summary: {
          totalUnits,
          occupiedUnits,
          vacantUnits,
          occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
          totalRent,
          occupiedRent,
          vacantRent,
          lossToVacancy: totalRent > 0 ? (vacantRent / totalRent) * 100 : 0
        },
        units: filteredUnits.map((unit: any) => ({
          id: unit.id,
          unitNumber: unit.unit_number,
          propertyName: unit.property.name,
          propertyAddress: unit.property.address,
          monthlyRent: parseFloat(unit.monthly_rent),
          securityDeposit: parseFloat(unit.security_deposit),
          leaseStatus: unit.lease_status,
          leaseStart: unit.lease_start,
          leaseEnd: unit.lease_end,
          tenant: unit.tenant ? {
            id: unit.tenant.id,
            name: `${unit.tenant.first_name} ${unit.tenant.last_name}`,
            email: unit.tenant.email,
            phone: unit.tenant.phone_number
          } : null,
          currentPaymentStatus: unit.payments
            ?.filter((p: any) => p.due_date <= date)
            ?.sort((a: any, b: any) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0]?.status || 'N/A'
        }))
      };
      
      return c.json(report);
      
    } catch (error) {
      console.error('Rent roll error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get payment history report
   */
  async getPaymentHistory(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.query('propertyId');
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');
      const tenantId = c.req.query('tenantId');
      
      let query = supabase
        .from('payments')
        .select(`
          *,
          tenant:users!payments_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          unit:units!payments_unit_id_fkey (
            id,
            unit_number,
            property:properties!units_property_id_fkey (
              id,
              name,
              address,
              owner_id
            )
          )
        `)
        .order('due_date', { ascending: false });
      
      if (startDate) {
        query = query.gte('due_date', startDate);
      }
      if (endDate) {
        query = query.lte('due_date', endDate);
      }
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data: payments, error } = await query;
      
      if (error) {
        console.error('Payment history fetch error:', error);
        return c.json({ error: 'Failed to fetch payment history' }, 500);
      }
      
      // Filter to only include payments from properties owned by the user
      const filteredPayments = payments?.filter((payment: any) => 
        payment.unit.property.owner_id === user.userId &&
        (!propertyId || payment.unit.property.id === propertyId)
      ) || [];
      
      // Calculate summary statistics
      const totalPayments = filteredPayments.length;
      const totalAmount = filteredPayments.reduce((sum: number, payment: any) => 
        sum + parseFloat(payment.amount), 0);
      const paidAmount = filteredPayments
        .filter((payment: any) => payment.status === 'PAID')
        .reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0);
      const pendingAmount = filteredPayments
        .filter((payment: any) => payment.status === 'PENDING')
        .reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0);
      const lateAmount = filteredPayments
        .filter((payment: any) => payment.status === 'LATE')
        .reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0);
      
      const report = {
        reportDate: new Date().toISOString().split('T')[0],
        dateRange: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        },
        summary: {
          totalPayments,
          totalAmount,
          paidAmount,
          pendingAmount,
          lateAmount,
          collectionRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
        },
        payments: filteredPayments.map((payment: any) => ({
          id: payment.id,
          amount: parseFloat(payment.amount),
          dueDate: payment.due_date,
          paymentDate: payment.payment_date,
          status: payment.status,
          method: payment.method,
          notes: payment.notes,
          tenant: {
            id: payment.tenant.id,
            name: `${payment.tenant.first_name} ${payment.tenant.last_name}`,
            email: payment.tenant.email
          },
          unit: {
            id: payment.unit.id,
            unitNumber: payment.unit.unit_number,
            propertyName: payment.unit.property.name,
            propertyAddress: payment.unit.property.address
          }
        }))
      };
      
      return c.json(report);
      
    } catch (error) {
      console.error('Payment history error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get maintenance log report
   */
  async getMaintenanceLog(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.query('propertyId');
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');
      const status = c.req.query('status');
      
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenant:users!maintenance_requests_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          unit:units!maintenance_requests_unit_id_fkey (
            id,
            unit_number,
            property:properties!units_property_id_fkey (
              id,
              name,
              address,
              owner_id
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data: requests, error } = await query;
      
      if (error) {
        console.error('Maintenance log fetch error:', error);
        return c.json({ error: 'Failed to fetch maintenance log' }, 500);
      }
      
      // Filter to only include requests from properties owned by the user
      const filteredRequests = requests?.filter((request: any) => 
        request.unit.property.owner_id === user.userId &&
        (!propertyId || request.unit.property.id === propertyId)
      ) || [];
      
      // Calculate summary statistics
      const totalRequests = filteredRequests.length;
      const completedRequests = filteredRequests.filter((r: any) => 
        r.status === 'COMPLETED'
      ).length;
      const openRequests = filteredRequests.filter((r: any) => 
        ['SUBMITTED', 'IN_PROGRESS'].includes(r.status)
      ).length;
      
      const report = {
        reportDate: new Date().toISOString().split('T')[0],
        dateRange: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        },
        summary: {
          totalRequests,
          completedRequests,
          openRequests,
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
        },
        requests: filteredRequests.map((request: any) => ({
          id: request.id,
          title: request.title,
          description: request.description,
          priority: request.priority,
          status: request.status,
          createdAt: request.created_at,
          updatedAt: request.updated_at,
          notes: request.notes,
          tenant: {
            id: request.tenant.id,
            name: `${request.tenant.first_name} ${request.tenant.last_name}`,
            email: request.tenant.email
          },
          unit: {
            id: request.unit.id,
            unitNumber: request.unit.unit_number,
            propertyName: request.unit.property.name,
            propertyAddress: request.unit.property.address
          }
        }))
      };
      
      return c.json(report);
      
    } catch (error) {
      console.error('Maintenance log error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get financial summary report
   */
  async getFinancialSummary(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.query('propertyId');
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');
      
      // Get properties
      let propertiesQuery = supabase
        .from('properties')
        .select(`
          *,
          units (
            id,
            unit_number,
            monthly_rent,
            security_deposit,
            lease_status
          )
        `)
        .eq('owner_id', user.userId);
      
      if (propertyId) {
        propertiesQuery = propertiesQuery.eq('id', propertyId);
      }
      
      const { data: properties, error: propertiesError } = await propertiesQuery;
      
      if (propertiesError) {
        console.error('Properties fetch error:', propertiesError);
        return c.json({ error: 'Failed to fetch properties' }, 500);
      }
      
      // Get payments
      let paymentsQuery = supabase
        .from('payments')
        .select(`
          *,
          unit:units!payments_unit_id_fkey (
            property:properties!units_property_id_fkey (
              id,
              owner_id
            )
          )
        `);
      
      if (startDate) {
        paymentsQuery = paymentsQuery.gte('due_date', startDate);
      }
      if (endDate) {
        paymentsQuery = paymentsQuery.lte('due_date', endDate);
      }
      
      const { data: payments, error: paymentsError } = await paymentsQuery;
      
      if (paymentsError) {
        console.error('Payments fetch error:', paymentsError);
        return c.json({ error: 'Failed to fetch payments' }, 500);
      }
      
      // Filter payments to only include those from properties owned by the user
      const filteredPayments = payments?.filter((payment: any) => 
        payment.unit.property.owner_id === user.userId &&
        (!propertyId || payment.unit.property.id === propertyId)
      ) || [];
      
      // Calculate financial metrics
      const totalProperties = properties?.length || 0;
      const totalUnits = properties?.reduce((sum: number, property: any) => 
        sum + (property.units?.length || 0), 0) || 0;
      const occupiedUnits = properties?.reduce((sum: number, property: any) => 
        sum + (property.units?.filter((unit: any) => unit.lease_status === 'LEASED').length || 0), 0) || 0;
      const vacantUnits = totalUnits - occupiedUnits;
      
      const totalRent = properties?.reduce((sum: number, property: any) => 
        sum + (property.units?.reduce((unitSum: number, unit: any) => 
          unitSum + parseFloat(unit.monthly_rent), 0) || 0), 0) || 0;
      const occupiedRent = properties?.reduce((sum: number, property: any) => 
        sum + (property.units?.filter((unit: any) => unit.lease_status === 'LEASED')
          .reduce((unitSum: number, unit: any) => unitSum + parseFloat(unit.monthly_rent), 0) || 0), 0) || 0;
      const vacantRent = totalRent - occupiedRent;
      
      const totalPayments = filteredPayments.length;
      const totalPaymentAmount = filteredPayments.reduce((sum: number, payment: any) => 
        sum + parseFloat(payment.amount), 0);
      const paidAmount = filteredPayments
        .filter((payment: any) => payment.status === 'PAID')
        .reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0);
      const pendingAmount = filteredPayments
        .filter((payment: any) => payment.status === 'PENDING')
        .reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0);
      const lateAmount = filteredPayments
        .filter((payment: any) => payment.status === 'LATE')
        .reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0);
      
      const report = {
        reportDate: new Date().toISOString().split('T')[0],
        dateRange: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        },
        portfolioSummary: {
          totalProperties,
          totalUnits,
          occupiedUnits,
          vacantUnits,
          occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
          totalRent,
          occupiedRent,
          vacantRent,
          lossToVacancy: totalRent > 0 ? (vacantRent / totalRent) * 100 : 0
        },
        revenueAnalysis: {
          totalPayments,
          totalPaymentAmount,
          paidAmount,
          pendingAmount,
          lateAmount,
          collectionRate: totalPaymentAmount > 0 ? (paidAmount / totalPaymentAmount) * 100 : 0
        },
        propertyBreakdown: properties?.map((property: any) => ({
          id: property.id,
          name: property.name,
          address: property.address,
          totalUnits: property.units?.length || 0,
          occupiedUnits: property.units?.filter((unit: any) => unit.lease_status === 'LEASED').length || 0,
          vacantUnits: (property.units?.length || 0) - (property.units?.filter((unit: any) => unit.lease_status === 'LEASED').length || 0),
          monthlyRent: property.units?.reduce((sum: number, unit: any) => 
            sum + parseFloat(unit.monthly_rent), 0) || 0,
          occupiedRent: property.units?.filter((unit: any) => unit.lease_status === 'LEASED')
            .reduce((sum: number, unit: any) => sum + parseFloat(unit.monthly_rent), 0) || 0
        })) || []
      };
      
      return c.json(report);
      
    } catch (error) {
      console.error('Financial summary error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get vacancy report
   */
  async getVacancyReport(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.query('propertyId');
      
      let query = supabase
        .from('units')
        .select(`
          *,
          property:properties!units_property_id_fkey (
            id,
            name,
            address,
            city,
            state,
            owner_id
          )
        `)
        .eq('property.owner_id', user.userId)
        .eq('lease_status', 'VACANT')
        .order('property.name')
        .order('unit_number');
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data: vacantUnits, error } = await query;
      
      if (error) {
        console.error('Vacancy report fetch error:', error);
        return c.json({ error: 'Failed to fetch vacancy report' }, 500);
      }
      
      // Filter to only include units from properties owned by the user
      const filteredUnits = vacantUnits?.filter((unit: any) => 
        unit.property.owner_id === user.userId
      ) || [];
      
      // Calculate vacancy metrics
      const totalVacantUnits = filteredUnits.length;
      const totalVacantRent = filteredUnits.reduce((sum: number, unit: any) => 
        sum + parseFloat(unit.monthly_rent), 0);
      
      const report = {
        reportDate: new Date().toISOString().split('T')[0],
        summary: {
          totalVacantUnits,
          totalVacantRent,
          avgVacantRent: totalVacantUnits > 0 ? totalVacantRent / totalVacantUnits : 0
        },
        vacantUnits: filteredUnits.map((unit: any) => ({
          id: unit.id,
          unitNumber: unit.unit_number,
          propertyName: unit.property.name,
          propertyAddress: unit.property.address,
          monthlyRent: parseFloat(unit.monthly_rent),
          securityDeposit: parseFloat(unit.security_deposit),
          leaseEnd: unit.lease_end,
          notes: unit.notes,
          daysSinceVacant: unit.lease_end 
            ? Math.floor((new Date().getTime() - new Date(unit.lease_end).getTime()) / (1000 * 60 * 60 * 24))
            : null
        }))
      };
      
      return c.json(report);
      
    } catch (error) {
      console.error('Vacancy report error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get lease expiration report
   */
  async getLeaseExpirationReport(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.query('propertyId');
      const months = parseInt(c.req.query('months') || '3', 10);
      
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + months);
      
      let query = supabase
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
            city,
            state,
            owner_id
          )
        `)
        .eq('property.owner_id', user.userId)
        .eq('lease_status', 'LEASED')
        .not('lease_end', 'is', null)
        .lte('lease_end', futureDate.toISOString().split('T')[0])
        .order('lease_end');
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data: expiringUnits, error } = await query;
      
      if (error) {
        console.error('Lease expiration report fetch error:', error);
        return c.json({ error: 'Failed to fetch lease expiration report' }, 500);
      }
      
      // Filter to only include units from properties owned by the user
      const filteredUnits = expiringUnits?.filter((unit: any) => 
        unit.property.owner_id === user.userId
      ) || [];
      
      // Group by expiration timeframe
      const now = new Date();
      const expired = filteredUnits.filter((unit: any) => 
        new Date(unit.lease_end) < now
      );
      const expiring30Days = filteredUnits.filter((unit: any) => {
        const leaseEnd = new Date(unit.lease_end);
        const days30 = new Date(now);
        days30.setDate(days30.getDate() + 30);
        return leaseEnd >= now && leaseEnd <= days30;
      });
      const expiring60Days = filteredUnits.filter((unit: any) => {
        const leaseEnd = new Date(unit.lease_end);
        const days30 = new Date(now);
        days30.setDate(days30.getDate() + 30);
        const days60 = new Date(now);
        days60.setDate(days60.getDate() + 60);
        return leaseEnd > days30 && leaseEnd <= days60;
      });
      const expiring90Days = filteredUnits.filter((unit: any) => {
        const leaseEnd = new Date(unit.lease_end);
        const days60 = new Date(now);
        days60.setDate(days60.getDate() + 60);
        const days90 = new Date(now);
        days90.setDate(days90.getDate() + 90);
        return leaseEnd > days60 && leaseEnd <= days90;
      });
      
      const report = {
        reportDate: new Date().toISOString().split('T')[0],
        timeframe: `${months} months`,
        summary: {
          totalExpiringLeases: filteredUnits.length,
          expired: expired.length,
          expiring30Days: expiring30Days.length,
          expiring60Days: expiring60Days.length,
          expiring90Days: expiring90Days.length
        },
        expiringLeases: filteredUnits.map((unit: any) => ({
          id: unit.id,
          unitNumber: unit.unit_number,
          propertyName: unit.property.name,
          propertyAddress: unit.property.address,
          monthlyRent: parseFloat(unit.monthly_rent),
          leaseStart: unit.lease_start,
          leaseEnd: unit.lease_end,
          daysUntilExpiration: Math.floor((new Date(unit.lease_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          tenant: unit.tenant ? {
            id: unit.tenant.id,
            name: `${unit.tenant.first_name} ${unit.tenant.last_name}`,
            email: unit.tenant.email,
            phone: unit.tenant.phone_number
          } : null,
          status: new Date(unit.lease_end) < now ? 'EXPIRED' : 
                  new Date(unit.lease_end) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) ? 'EXPIRING_30_DAYS' :
                  new Date(unit.lease_end) <= new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) ? 'EXPIRING_60_DAYS' :
                  'EXPIRING_90_DAYS'
        }))
      };
      
      return c.json(report);
      
    } catch (error) {
      console.error('Lease expiration report error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}

export const reportsController = new ReportsController(); 