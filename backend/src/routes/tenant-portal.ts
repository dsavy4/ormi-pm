import { Hono } from 'hono';
import { TenantPortalController } from '../controllers/TenantPortalController';

const app = new Hono();
const tenantController = new TenantPortalController();

// Tenant login (no auth required)
app.post('/login', (c) => tenantController.login(c));

// Protected routes (require authentication)
app.get('/dashboard', (c) => tenantController.getDashboard(c));

// Profile management
app.get('/profile', (c) => tenantController.getProfile(c));
app.put('/profile', (c) => tenantController.updateProfile(c));

// Payments
app.get('/payments', (c) => tenantController.getPayments(c));
app.post('/payments', (c) => tenantController.makePayment(c));

// Maintenance requests
app.get('/maintenance', (c) => tenantController.getMaintenanceRequests(c));
app.post('/maintenance', (c) => tenantController.submitMaintenanceRequest(c));

// Documents
app.get('/documents', (c) => tenantController.getDocuments(c));
app.post('/documents/upload', (c) => tenantController.uploadDocuments(c));

// Notifications
app.get('/notifications', (c) => tenantController.getNotifications(c));
app.put('/notifications/:id/read', (c) => tenantController.markNotificationRead(c));

// Communication
app.post('/contact-manager', (c) => tenantController.contactManager(c));

export default app; 