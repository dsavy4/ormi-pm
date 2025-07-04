import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';

export class PaymentController {
  /**
   * Get all payments for authenticated user
   */
  async getAll(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const page = parseInt(c.req.query('page') || '1', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);
      const status = c.req.query('status');
      const propertyId = c.req.query('propertyId');
      
      let query = supabase
        .from('payments')
        .select(`
          *,
          tenant:users!payments_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          unit:units!payments_unit_id_fkey (
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
        .order('due_date', { ascending: false });
      
      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      
      if (propertyId) {
        query = query.eq('unit.property.id', propertyId);
      }
      
      const { data: payments, error } = await query
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) {
        console.error('Payments fetch error:', error);
        return c.json({ error: 'Failed to fetch payments' }, 500);
      }
      
      // Filter to only include payments from properties owned by the user
      const filteredPayments = payments?.filter((payment: any) => 
        payment.unit.property.owner_id === user.userId
      ) || [];
      
      return c.json(filteredPayments);
      
    } catch (error) {
      console.error('Payments fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get payment by ID
   */
  async getById(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const paymentId = c.req.param('id');
      
      const { data: payment, error } = await supabase
        .from('payments')
        .select(`
          *,
          tenant:users!payments_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          unit:units!payments_unit_id_fkey (
            id,
            unit_number,
            monthly_rent,
            security_deposit,
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
        .eq('id', paymentId)
        .single();
      
      if (error || !payment) {
        return c.json({ error: 'Payment not found' }, 404);
      }
      
      // Verify user owns the property
      if (payment.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Access denied' }, 403);
      }
      
      return c.json(payment);
      
    } catch (error) {
      console.error('Payment fetch error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Create new payment
   */
  async create(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      const { 
        unitId, 
        tenantId, 
        amount, 
        dueDate, 
        method = 'MANUAL',
        notes 
      } = body;
      
      if (!unitId || !tenantId || !amount || !dueDate) {
        return c.json({ error: 'Unit ID, tenant ID, amount, and due date are required' }, 400);
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
      
      const { data: payment, error } = await supabase
        .from('payments')
        .insert([
          {
            unit_id: unitId,
            tenant_id: tenantId,
            amount: amount,
            due_date: dueDate,
            method: method,
            notes: notes,
            status: 'PENDING'
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Payment creation error:', error);
        return c.json({ error: 'Failed to create payment' }, 500);
      }
      
      return c.json(payment);
      
    } catch (error) {
      console.error('Payment creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Update payment
   */
  async update(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const paymentId = c.req.param('id');
      const body = await c.req.json();
      
      // Verify user owns the property
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          id,
          unit:units!payments_unit_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', paymentId)
        .single();
      
      if (paymentError || !payment || payment.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Payment not found or access denied' }, 404);
      }
      
      const { 
        amount, 
        dueDate, 
        status, 
        method,
        paymentDate,
        stripePaymentId,
        notes 
      } = body;
      
      const updateData: any = {};
      if (amount !== undefined) updateData.amount = amount;
      if (dueDate !== undefined) updateData.due_date = dueDate;
      if (status !== undefined) updateData.status = status;
      if (method !== undefined) updateData.method = method;
      if (paymentDate !== undefined) updateData.payment_date = paymentDate;
      if (stripePaymentId !== undefined) updateData.stripe_payment_id = stripePaymentId;
      if (notes !== undefined) updateData.notes = notes;
      
      const { data: updatedPayment, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) {
        console.error('Payment update error:', error);
        return c.json({ error: 'Failed to update payment' }, 500);
      }
      
      return c.json(updatedPayment);
      
    } catch (error) {
      console.error('Payment update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Delete payment
   */
  async delete(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const paymentId = c.req.param('id');
      
      // Verify user owns the property
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          id,
          status,
          unit:units!payments_unit_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', paymentId)
        .single();
      
      if (paymentError || !payment || payment.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Payment not found or access denied' }, 404);
      }
      
      // Don't allow deletion of paid payments
      if (payment.status === 'PAID') {
        return c.json({ error: 'Cannot delete paid payment' }, 400);
      }
      
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);
      
      if (error) {
        console.error('Payment deletion error:', error);
        return c.json({ error: 'Failed to delete payment' }, 500);
      }
      
      return c.json({ message: 'Payment deleted successfully' });
      
    } catch (error) {
      console.error('Payment deletion error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Mark payment as paid
   */
  async markAsPaid(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const paymentId = c.req.param('id');
      const body = await c.req.json();
      
      const { paymentDate, method = 'MANUAL', notes } = body;
      
      // Verify user owns the property
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          id,
          unit:units!payments_unit_id_fkey (
            property:properties!units_property_id_fkey (
              owner_id
            )
          )
        `)
        .eq('id', paymentId)
        .single();
      
      if (paymentError || !payment || payment.unit.property.owner_id !== user.userId) {
        return c.json({ error: 'Payment not found or access denied' }, 404);
      }
      
      const { data: updatedPayment, error } = await supabase
        .from('payments')
        .update({
          status: 'PAID',
          payment_date: paymentDate || new Date().toISOString(),
          method: method,
          notes: notes
        })
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) {
        console.error('Payment update error:', error);
        return c.json({ error: 'Failed to mark payment as paid' }, 500);
      }
      
      return c.json(updatedPayment);
      
    } catch (error) {
      console.error('Payment update error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Generate recurring payments for a unit
   */
  async generateRecurringPayments(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      const { unitId, months = 12, startDate } = body;
      
      if (!unitId || !startDate) {
        return c.json({ error: 'Unit ID and start date are required' }, 400);
      }
      
      // Verify user owns the property and get unit details
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          monthly_rent,
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
      
      if (!unit.tenant_id) {
        return c.json({ error: 'Unit must have a tenant assigned' }, 400);
      }
      
      // Generate payments for the specified number of months
      const paymentsToCreate = [];
      const baseDate = new Date(startDate);
      
      for (let i = 0; i < months; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(baseDate.getMonth() + i);
        
        paymentsToCreate.push({
          unit_id: unitId,
          tenant_id: unit.tenant_id,
          amount: unit.monthly_rent,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'PENDING',
          method: 'MANUAL'
        });
      }
      
      const { data: payments, error } = await supabase
        .from('payments')
        .insert(paymentsToCreate)
        .select();
      
      if (error) {
        console.error('Recurring payments creation error:', error);
        return c.json({ error: 'Failed to create recurring payments' }, 500);
      }
      
      return c.json({ 
        message: `Successfully created ${payments.length} recurring payments`,
        payments: payments
      });
      
    } catch (error) {
      console.error('Recurring payments creation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get payment summary/analytics
   */
  async getSummary(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const propertyId = c.req.query('propertyId');
      const startDate = c.req.query('startDate');
      const endDate = c.req.query('endDate');
      
      let query = supabase
        .from('payments')
        .select(`
          *,
          unit:units!payments_unit_id_fkey (
            property:properties!units_property_id_fkey (
              id,
              name,
              owner_id
            )
          )
        `);
      
      // Apply date filters
      if (startDate) {
        query = query.gte('due_date', startDate);
      }
      if (endDate) {
        query = query.lte('due_date', endDate);
      }
      
      const { data: payments, error } = await query;
      
      if (error) {
        console.error('Payment summary fetch error:', error);
        return c.json({ error: 'Failed to fetch payment summary' }, 500);
      }
      
      // Filter to only include payments from properties owned by the user
      const filteredPayments = payments?.filter((payment: any) => 
        payment.unit.property.owner_id === user.userId &&
        (!propertyId || payment.unit.property.id === propertyId)
      ) || [];
      
      // Calculate summary statistics
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
      
      const summary = {
        totalPayments: filteredPayments.length,
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        pendingAmount: pendingAmount,
        lateAmount: lateAmount,
        collectionRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
        paymentsByStatus: {
          PAID: filteredPayments.filter((p: any) => p.status === 'PAID').length,
          PENDING: filteredPayments.filter((p: any) => p.status === 'PENDING').length,
          LATE: filteredPayments.filter((p: any) => p.status === 'LATE').length,
          FAILED: filteredPayments.filter((p: any) => p.status === 'FAILED').length
        }
      };
      
      return c.json(summary);
      
    } catch (error) {
      console.error('Payment summary error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}

export const paymentController = new PaymentController(); 