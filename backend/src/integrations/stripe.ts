import Stripe from 'stripe';
import { getSupabaseClient } from '../utils/supabase';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class StripeService {
  /**
   * Create a payment intent
   */
  static async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: any;
    paymentMethodTypes?: string[];
    description?: string;
  }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        customer: data.customerId,
        metadata: data.metadata,
        payment_method_types: data.paymentMethodTypes || ['card', 'us_bank_account'],
        description: data.description,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          requiresAction: paymentIntent.status === 'requires_action',
        },
      };
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process a payment
   */
  static async processPayment(data: {
    amount: number;
    paymentMethodId: string;
    customerId?: string;
    metadata?: any;
    description?: string;
  }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: 'usd',
        customer: data.customerId,
        payment_method: data.paymentMethodId,
        metadata: data.metadata,
        description: data.description,
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/tenant/payments/success`,
      });

      return {
        success: true,
        data: {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      };
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create or get customer
   */
  static async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: any;
  }) {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: data.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return {
          success: true,
          data: {
            customerId: existingCustomers.data[0].id,
            isNew: false,
          },
        };
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        metadata: data.metadata,
      });

      return {
        success: true,
        data: {
          customerId: customer.id,
          isNew: true,
        },
      };
    } catch (error: any) {
      console.error('Stripe customer creation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Save payment method
   */
  static async savePaymentMethod(data: {
    paymentMethodId: string;
    customerId: string;
    setAsDefault?: boolean;
  }) {
    try {
      // Attach payment method to customer
      await stripe.paymentMethods.attach(data.paymentMethodId, {
        customer: data.customerId,
      });

      // Set as default if requested
      if (data.setAsDefault) {
        await stripe.customers.update(data.customerId, {
          invoice_settings: {
            default_payment_method: data.paymentMethodId,
          },
        });
      }

      return {
        success: true,
        data: {
          paymentMethodId: data.paymentMethodId,
          customerId: data.customerId,
        },
      };
    } catch (error: any) {
      console.error('Stripe save payment method error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get customer payment methods
   */
  static async getCustomerPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const bankAccounts = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'us_bank_account',
      });

      return {
        success: true,
        data: {
          cards: paymentMethods.data.map(pm => ({
            id: pm.id,
            type: 'card',
            last4: pm.card?.last4,
            brand: pm.card?.brand,
            expiryMonth: pm.card?.exp_month,
            expiryYear: pm.card?.exp_year,
            isDefault: false, // Would need to check against customer default
          })),
          bankAccounts: bankAccounts.data.map(pm => ({
            id: pm.id,
            type: 'bank_account',
            last4: pm.us_bank_account?.last4,
            bankName: pm.us_bank_account?.bank_name,
            isDefault: false,
          })),
        },
      };
    } catch (error: any) {
      console.error('Stripe get payment methods error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create subscription
   */
  static async createSubscription(data: {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    metadata?: any;
  }) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: data.metadata,
      });

      return {
        success: true,
        data: {
          subscriptionId: subscription.id,
          status: subscription.status,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        },
      };
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle webhook events
   */
  static async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Webhook handling error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle successful payment
   */
  private static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      const supabase = getSupabaseClient();
      
      // Update payment record in database
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'PAID',
          stripe_payment_intent_id: paymentIntent.id,
          paid_at: new Date().toISOString(),
          amount_paid: paymentIntent.amount / 100,
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (error) {
        console.error('Database update error:', error);
      }

      // Send confirmation email
      // await this.sendPaymentConfirmationEmail(paymentIntent);

    } catch (error) {
      console.error('Payment succeeded handling error:', error);
    }
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      const supabase = getSupabaseClient();
      
      // Update payment record in database
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'FAILED',
          stripe_payment_intent_id: paymentIntent.id,
          failure_reason: paymentIntent.last_payment_error?.message,
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (error) {
        console.error('Database update error:', error);
      }

      // Send failure notification
      // await this.sendPaymentFailureEmail(paymentIntent);

    } catch (error) {
      console.error('Payment failed handling error:', error);
    }
  }

  /**
   * Handle successful invoice payment
   */
  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
      // Handle recurring payment success
      console.log('Invoice payment succeeded:', invoice.id);
    } catch (error) {
      console.error('Invoice payment succeeded handling error:', error);
    }
  }

  /**
   * Handle failed invoice payment
   */
  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    try {
      // Handle recurring payment failure
      console.log('Invoice payment failed:', invoice.id);
    } catch (error) {
      console.error('Invoice payment failed handling error:', error);
    }
  }

  /**
   * Handle subscription created
   */
  private static async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      console.log('Subscription created:', subscription.id);
    } catch (error) {
      console.error('Subscription created handling error:', error);
    }
  }

  /**
   * Handle subscription updated
   */
  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      console.log('Subscription updated:', subscription.id);
    } catch (error) {
      console.error('Subscription updated handling error:', error);
    }
  }

  /**
   * Handle subscription deleted
   */
  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      console.log('Subscription deleted:', subscription.id);
    } catch (error) {
      console.error('Subscription deleted handling error:', error);
    }
  }

  /**
   * Generate invoice
   */
  static async generateInvoice(data: {
    customerId: string;
    amount: number;
    description: string;
    metadata?: any;
  }) {
    try {
      const invoice = await stripe.invoices.create({
        customer: data.customerId,
        amount: data.amount,
        currency: 'usd',
        description: data.description,
        metadata: data.metadata,
      });

      return {
        success: true,
        data: {
          invoiceId: invoice.id,
          invoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
        },
      };
    } catch (error: any) {
      console.error('Stripe invoice generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount,
      });

      return {
        success: true,
        data: {
          refundId: refund.id,
          amount: refund.amount,
          status: refund.status,
        },
      };
    } catch (error: any) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get payment intent
   */
  static async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        data: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customerId: paymentIntent.customer as string,
          metadata: paymentIntent.metadata,
        },
      };
    } catch (error: any) {
      console.error('Stripe get payment intent error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
} 