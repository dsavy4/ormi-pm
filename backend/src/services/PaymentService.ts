import { getSupabaseClient } from '../utils/supabase';

// Stripe types (would be imported from @stripe/stripe-js in real implementation)
interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  bank_account?: {
    bank_name: string;
    last4: string;
    routing_number: string;
  };
}

export class PaymentService {
  private stripe: any; // Would be Stripe instance
  private supabase: any;

  constructor(env: any) {
    this.supabase = getSupabaseClient(env);
    // Initialize Stripe with secret key
    // this.stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  }

  /**
   * Create a payment intent for rent payment
   */
  async createPaymentIntent(tenantId: string, amount: number, description: string): Promise<StripePaymentIntent> {
    try {
      // Get tenant information
      const { data: tenant, error: tenantError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError || !tenant) {
        throw new Error('Tenant not found');
      }

      // Create or get Stripe customer
      const customer = await this.getOrCreateCustomer(tenant);

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: customer.id,
        description: description,
        metadata: {
          tenant_id: tenantId,
          payment_type: 'rent'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw error;
    }
  }

  /**
   * Get or create Stripe customer
   */
  async getOrCreateCustomer(tenant: any): Promise<StripeCustomer> {
    try {
      // Check if customer already exists
      const { data: existingCustomer } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', tenant.id)
        .single();

      if (existingCustomer) {
        // Get customer from Stripe
        const customer = await this.stripe.customers.retrieve(existingCustomer.stripe_customer_id);
        return customer;
      }

      // Create new customer in Stripe
      const customer = await this.stripe.customers.create({
        email: tenant.email,
        name: `${tenant.first_name} ${tenant.last_name}`,
        phone: tenant.phone_number,
        metadata: {
          user_id: tenant.id,
          user_type: 'tenant'
        }
      });

      // Save customer reference
      await this.supabase
        .from('stripe_customers')
        .insert({
          user_id: tenant.id,
          stripe_customer_id: customer.id,
          email: tenant.email
        });

      return customer;
    } catch (error) {
      console.error('Customer creation error:', error);
      throw error;
    }
  }

  /**
   * Process a successful payment
   */
  async processPayment(paymentIntentId: string): Promise<any> {
    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }

      const tenantId = paymentIntent.metadata.tenant_id;
      const amount = paymentIntent.amount / 100; // Convert from cents

      // Get tenant's unit
      const { data: unit, error: unitError } = await this.supabase
        .from('units')
        .select('id, property_id')
        .eq('tenant_id', tenantId)
        .single();

      if (unitError || !unit) {
        throw new Error('Tenant unit not found');
      }

      // Create payment record
      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .insert({
          tenant_id: tenantId,
          unit_id: unit.id,
          amount: amount,
          payment_date: new Date().toISOString(),
          due_date: new Date().toISOString(), // Would be calculated based on lease
          status: 'PAID',
          method: 'STRIPE_CARD',
          stripe_payment_id: paymentIntentId,
          notes: 'Online payment via Stripe'
        })
        .select()
        .single();

      if (paymentError) {
        throw new Error('Failed to save payment record');
      }

      // Update any pending payments
      await this.supabase
        .from('payments')
        .update({ status: 'PAID' })
        .eq('tenant_id', tenantId)
        .eq('status', 'PENDING')
        .lte('due_date', new Date().toISOString());

      return payment;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  /**
   * Set up recurring payments
   */
  async setupRecurringPayment(tenantId: string, amount: number, interval: 'month' | 'week'): Promise<any> {
    try {
      // Get tenant information
      const { data: tenant, error: tenantError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError || !tenant) {
        throw new Error('Tenant not found');
      }

      const customer = await this.getOrCreateCustomer(tenant);

      // Create subscription in Stripe
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Monthly Rent',
              description: 'Recurring rent payment'
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: interval
            }
          }
        }],
        metadata: {
          tenant_id: tenantId,
          payment_type: 'recurring_rent'
        }
      });

      // Save subscription reference
      await this.supabase
        .from('subscriptions')
        .insert({
          user_id: tenantId,
          stripe_customer_id: customer.id,
          stripe_subscription_id: subscription.id,
          plan: 'BASIC',
          status: 'ACTIVE',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        });

      return subscription;
    } catch (error) {
      console.error('Recurring payment setup error:', error);
      throw error;
    }
  }

  /**
   * Get payment methods for a tenant
   */
  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    try {
      const { data: customer } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', tenantId)
        .single();

      if (!customer) {
        return [];
      }

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customer.stripe_customer_id,
        type: 'card'
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(tenantId: string, paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const { data: customer } = await this.supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', tenantId)
        .single();

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.stripe_customer_id
      });

      // Set as default payment method
      await this.stripe.customers.update(customer.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Add payment method error:', error);
      throw error;
    }
  }

  /**
   * Remove a payment method
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Remove payment method error:', error);
      throw error;
    }
  }

  /**
   * Calculate late fees
   */
  async calculateLateFees(tenantId: string): Promise<number> {
    try {
      const { data: overduePayments, error } = await this.supabase
        .from('payments')
        .select('amount, due_date')
        .eq('tenant_id', tenantId)
        .eq('status', 'PENDING')
        .lt('due_date', new Date().toISOString());

      if (error) {
        throw error;
      }

      let totalLateFees = 0;
      const lateFeeRate = 0.05; // 5% late fee
      const gracePeriod = 5; // 5 days grace period

      overduePayments?.forEach(payment => {
        const dueDate = new Date(payment.due_date);
        const today = new Date();
        const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLate > gracePeriod) {
          totalLateFees += parseFloat(payment.amount) * lateFeeRate;
        }
      });

      return totalLateFees;
    } catch (error) {
      console.error('Late fee calculation error:', error);
      throw error;
    }
  }

  /**
   * Generate payment receipt
   */
  async generateReceipt(paymentId: string): Promise<any> {
    try {
      const { data: payment, error } = await this.supabase
        .from('payments')
        .select(`
          *,
          tenant:users!payments_tenant_id_fkey (
            first_name,
            last_name,
            email
          ),
          unit:units!payments_unit_id_fkey (
            unit_number,
            property:properties!units_property_id_fkey (
              name,
              address
            )
          )
        `)
        .eq('id', paymentId)
        .single();

      if (error || !payment) {
        throw new Error('Payment not found');
      }

      const receipt = {
        id: `REC-${paymentId}`,
        paymentId: payment.id,
        amount: payment.amount,
        date: payment.payment_date,
        method: payment.method,
        tenant: `${payment.tenant.first_name} ${payment.tenant.last_name}`,
        property: payment.unit.property.name,
        unit: payment.unit.unit_number,
        address: payment.unit.property.address,
        description: 'Rent Payment',
        status: payment.status
      };

      return receipt;
    } catch (error) {
      console.error('Receipt generation error:', error);
      throw error;
    }
  }

  /**
   * Send payment reminders
   */
  async sendPaymentReminders(): Promise<void> {
    try {
      const { data: upcomingPayments, error } = await this.supabase
        .from('payments')
        .select(`
          *,
          tenant:users!payments_tenant_id_fkey (
            email,
            first_name,
            last_name
          )
        `)
        .eq('status', 'PENDING')
        .gte('due_date', new Date().toISOString())
        .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()); // Next 7 days

      if (error) {
        throw error;
      }

      // Send reminders (would integrate with email service)
      upcomingPayments?.forEach(payment => {
        console.log(`Sending reminder to ${payment.tenant.email} for payment due ${payment.due_date}`);
        // EmailService.sendPaymentReminder(payment);
      });
    } catch (error) {
      console.error('Payment reminder error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: string, amount?: number): Promise<any> {
    try {
      const { data: payment, error } = await this.supabase
        .from('payments')
        .select('stripe_payment_id, amount')
        .eq('id', paymentId)
        .single();

      if (error || !payment) {
        throw new Error('Payment not found');
      }

      const refundAmount = amount ? Math.round(amount * 100) : Math.round(parseFloat(payment.amount) * 100);

      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripe_payment_id,
        amount: refundAmount
      });

      // Update payment status
      await this.supabase
        .from('payments')
        .update({ status: 'REFUNDED' })
        .eq('id', paymentId);

      return refund;
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }
} 