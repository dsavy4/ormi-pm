import { Hono } from 'hono';
import { PaymentController } from '../controllers/PaymentController';

const app = new Hono();
const paymentController = new PaymentController();

// Note: Authentication middleware will be applied in worker-server.ts

// Payment processing
app.post('/create-payment-intent', (c) => paymentController.createPaymentIntent(c));
app.post('/process-payment', (c) => paymentController.processPayment(c));

// Payment history and management
app.get('/history', (c) => paymentController.getPaymentHistory(c));
app.get('/analytics', (c) => paymentController.getPaymentAnalytics(c));

// Payment methods
app.get('/payment-methods', (c) => paymentController.getPaymentMethods(c));
app.post('/payment-methods', (c) => paymentController.savePaymentMethod(c));
app.delete('/payment-methods/:id', (c) => paymentController.deletePaymentMethod(c));

// Receipts
app.get('/receipts/:id', (c) => paymentController.generateReceipt(c));

// Stripe webhook (no auth required)
app.post('/webhook', (c) => paymentController.handleWebhook(c));

export default app; 