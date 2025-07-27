import { Hono } from 'hono';
import { ManagerController } from '../controllers/ManagerController';

const app = new Hono();
const managerController = new ManagerController();

// Note: Authentication middleware will be applied in worker-server.ts

// Get all managers
app.get('/', (c) => managerController.getAll(c));

// Get manager by ID
app.get('/:id', (c) => managerController.getById(c));

// Create new manager
app.post('/', (c) => managerController.create(c));

// Update manager
app.put('/:id', (c) => managerController.update(c));

// Delete/deactivate manager
app.delete('/:id', (c) => managerController.delete(c));

// Assign properties to manager
app.post('/:id/assign-properties', (c) => managerController.assignProperties(c));

// Get manager performance analytics
app.get('/:id/performance', (c) => managerController.getPerformance(c));

export default app; 