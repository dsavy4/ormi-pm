import { Context } from 'hono';
import { getSupabaseClient } from '../utils/supabase';
import { StripeService } from '../integrations/stripe';

export class PaymentController {
  /**
   * Create payment intent
   */
  async createPaymentIntent(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      const { 
        amount, 
        currency = 'usd', 
        propertyId, 
        unitId, 
        paymentMethodType,
        isScheduled,
        scheduleDate,
        isRecurring,
        recurringInterval
      } = body;

      if (!amount || amount <= 0) {
        return c.json({ error: 'Invalid amount' }, 400);
      }

      // Get or create Stripe customer
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id, email, first_name, last_name')
        .eq('id', user.id)
        .single();

      let customerId = userData?.stripe_customer_id;

      if (!customerId) {
        const customerResult = await StripeService.createCustomer({
          email: userData?.email || user.email,
          name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim(),
          metadata: { userId: user.id },
        });

        if (!customerResult.success) {
          return c.json({ error: 'Failed to create customer' }, 500);
        }

        customerId = customerResult.data.customerId;

        // Update user with Stripe customer ID
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
      }

      // Create payment intent
      const paymentIntentResult = await StripeService.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customerId,
        metadata: {
          userId: user.id,
          propertyId,
          unitId,
          paymentMethodType,
          isScheduled: isScheduled ? 'true' : 'false',
          scheduleDate: scheduleDate || '',
          isRecurring: isRecurring ? 'true' : 'false',
          recurringInterval: recurringInterval || '',
        },
        description: `Rent payment for property ${propertyId}`,
        paymentMethodTypes: paymentMethodType === 'ach' ? ['us_bank_account'] : ['card', 'us_bank_account'],
      });

      if (!paymentIntentResult.success) {
        return c.json({ error: paymentIntentResult.error }, 500);
      }

      // Create payment record in database
      const { data: paymentRecord, error: dbError } = await supabase
        .from('payments')
        .insert([
          {
            user_id: user.id,
            property_id: propertyId,
            unit_id: unitId,
            amount: amount,
            currency: currency,
            status: 'PENDING',
            stripe_payment_intent_id: paymentIntentResult.data.paymentIntentId,
            payment_method_type: paymentMethodType,
            is_scheduled: isScheduled || false,
            scheduled_date: scheduleDate,
            is_recurring: isRecurring || false,
            recurring_interval: recurringInterval,
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return c.json({ error: 'Failed to create payment record' }, 500);
      }

      return c.json({
        success: true,
        data: {
          ...paymentIntentResult.data,
          paymentId: paymentRecord.id,
        }
      });
      
    } catch (error) {
      console.error('Create payment intent error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Process payment
   */
  async processPayment(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      const { 
        amount, 
        paymentMethodId, 
        propertyId, 
        unitId,
        isScheduled,
        scheduleDate,
        isRecurring,
        recurringInterval
      } = body;

      if (!amount || !paymentMethodId) {
        return c.json({ error: 'Amount and payment method are required' }, 400);
      }

      // Get user's Stripe customer ID
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (!userData?.stripe_customer_id) {
        return c.json({ error: 'Customer not found' }, 404);
      }

      // Process payment
      const paymentResult = await StripeService.processPayment({
        amount: Math.round(amount * 100),
        paymentMethodId,
        customerId: userData.stripe_customer_id,
        metadata: {
          userId: user.id,
          propertyId,
          unitId,
          isScheduled: isScheduled ? 'true' : 'false',
          scheduleDate: scheduleDate || '',
          isRecurring: isRecurring ? 'true' : 'false',
          recurringInterval: recurringInterval || '',
        },
        description: `Rent payment for property ${propertyId}`,
      });

      if (!paymentResult.success) {
        return c.json({ error: paymentResult.error }, 500);
      }

      // Create payment record
      const { data: paymentRecord, error: dbError } = await supabase
        .from('payments')
        .insert([
          {
            user_id: user.id,
            property_id: propertyId,
            unit_id: unitId,
            amount: amount,
            currency: 'usd',
            status: paymentResult.data.status === 'succeeded' ? 'PAID' : 'PENDING',
            stripe_payment_intent_id: paymentResult.data.paymentIntentId,
            payment_method_id: paymentMethodId,
            is_scheduled: isScheduled || false,
            scheduled_date: scheduleDate,
            is_recurring: isRecurring || false,
            recurring_interval: recurringInterval,
            paid_at: paymentResult.data.status === 'succeeded' ? new Date().toISOString() : null,
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return c.json({ error: 'Failed to create payment record' }, 500);
      }

      return c.json({
        success: true,
        data: {
          paymentId: paymentRecord.id,
          status: paymentResult.data.status,
          amount: paymentResult.data.amount / 100,
        }
      });
      
    } catch (error) {
      console.error('Process payment error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          currency,
          status,
          created_at,
          paid_at,
          stripe_payment_intent_id,
          payment_method_type,
          is_scheduled,
          scheduled_date,
          is_recurring,
          recurring_interval,
          properties (
            id,
            name,
            address
          ),
          units (
            id,
            unit_number
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get payment history error:', error);
        return c.json({ error: 'Failed to fetch payment history' }, 500);
      }

      // Get Stripe payment details for each payment
      const paymentsWithDetails = await Promise.all(
        payments?.map(async (payment) => {
          let stripeDetails = null;
          
          if (payment.stripe_payment_intent_id) {
            const stripeResult = await StripeService.getPaymentIntent(payment.stripe_payment_intent_id);
            if (stripeResult.success) {
              stripeDetails = stripeResult.data;
            }
          }

          return {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            createdAt: payment.created_at,
            paidAt: payment.paid_at,
            isScheduled: payment.is_scheduled,
            scheduledDate: payment.scheduled_date,
            isRecurring: payment.is_recurring,
            recurringInterval: payment.recurring_interval,
            paymentMethodType: payment.payment_method_type,
            property: payment.properties,
            unit: payment.units,
            stripeDetails,
          };
        }) || []
      );

      return c.json({ success: true, data: paymentsWithDetails });
      
    } catch (error) {
      console.error('Get payment history error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      // Get user's Stripe customer ID
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (!userData?.stripe_customer_id) {
        return c.json({ success: true, data: { cards: [], bankAccounts: [] } });
      }

      // Get payment methods from Stripe
      const paymentMethodsResult = await StripeService.getCustomerPaymentMethods(userData.stripe_customer_id);

      if (!paymentMethodsResult.success) {
        return c.json({ error: paymentMethodsResult.error }, 500);
      }

      return c.json({ success: true, data: paymentMethodsResult.data });
      
    } catch (error) {
      console.error('Get payment methods error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Save payment method
   */
  async savePaymentMethod(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      const body = await c.req.json();
      
      const { paymentMethodId, setAsDefault = false } = body;

      if (!paymentMethodId) {
        return c.json({ error: 'Payment method ID is required' }, 400);
      }

      // Get user's Stripe customer ID
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (!userData?.stripe_customer_id) {
        return c.json({ error: 'Customer not found' }, 404);
      }

      // Save payment method
      const saveResult = await StripeService.savePaymentMethod({
        paymentMethodId,
        customerId: userData.stripe_customer_id,
        setAsDefault,
      });

      if (!saveResult.success) {
        return c.json({ error: saveResult.error }, 500);
      }

      return c.json({ success: true, data: saveResult.data });
      
    } catch (error) {
      console.error('Save payment method error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(c: Context) {
    try {
      const paymentMethodId = c.req.param('id');

      if (!paymentMethodId) {
        return c.json({ error: 'Payment method ID is required' }, 400);
      }

      // Delete payment method from Stripe
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.paymentMethods.detach(paymentMethodId);

      return c.json({ success: true, message: 'Payment method deleted successfully' });
      
    } catch (error) {
      console.error('Delete payment method error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Generate receipt
   */
  async generateReceipt(c: Context) {
    try {
      const paymentId = c.req.param('id');
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;

      // Get payment details
      const { data: payment, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          currency,
          status,
          created_at,
          paid_at,
          stripe_payment_intent_id,
          properties (
            id,
            name,
            address
          ),
          units (
            id,
            unit_number
          )
        `)
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .single();

      if (error || !payment) {
        return c.json({ error: 'Payment not found' }, 404);
      }

      // Generate receipt data
      const receipt = {
        receiptNumber: `RCP-${payment.id}`,
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        date: payment.paid_at || payment.created_at,
        property: payment.properties,
        unit: payment.units,
        stripePaymentIntentId: payment.stripe_payment_intent_id,
      };

      return c.json({ success: true, data: receipt });
      
    } catch (error) {
      console.error('Generate receipt error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(c: Context) {
    try {
      const body = await c.req.text();
      const signature = c.req.header('stripe-signature');

      if (!signature) {
        return c.json({ error: 'No signature provided' }, 400);
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle webhook event
      const result = await StripeService.handleWebhook(event);

      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      return c.json({ success: true });
      
    } catch (error: any) {
      console.error('Webhook error:', error);
      return c.json({ error: error.message }, 400);
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(c: Context) {
    try {
      const supabase = getSupabaseClient(c.env);
      const user = c.get('user') as any;
      
      // Get payment statistics
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, status, created_at, paid_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Get payment analytics error:', error);
        return c.json({ error: 'Failed to fetch payment analytics' }, 500);
      }

      // Calculate analytics
      const totalPayments = payments?.length || 0;
      const totalAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const paidPayments = payments?.filter(p => p.status === 'PAID').length || 0;
      const pendingPayments = payments?.filter(p => p.status === 'PENDING').length || 0;
      const failedPayments = payments?.filter(p => p.status === 'FAILED').length || 0;

      // Monthly breakdown
      const monthlyData = payments?.reduce((acc, payment) => {
        const month = new Date(payment.created_at).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { amount: 0, count: 0 };
        }
        acc[month].amount += payment.amount;
        acc[month].count += 1;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>) || {};

      const analytics = {
        totalPayments,
        totalAmount,
        paidPayments,
        pendingPayments,
        failedPayments,
        successRate: totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0,
        averagePayment: totalPayments > 0 ? totalAmount / totalPayments : 0,
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          amount: data.amount,
          count: data.count,
        })),
      };

      return c.json({ success: true, data: analytics });
      
    } catch (error) {
      console.error('Get payment analytics error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}

export const paymentController = new PaymentController(); 