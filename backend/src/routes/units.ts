import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { UnitController } from '../controllers/UnitController';

const router = Router();
const unitController = new UnitController();

// All routes require authentication
router.use(authenticateToken);

// GET /api/units - Get all units (legacy route)
router.get('/', (req: AuthRequest, res) => {
  res.json({ message: 'Units route working', user: req.user });
});



// GET /api/units/:id - Get single unit
router.get('/:id', async (req: AuthRequest, res) => {
  await unitController.getById(req, res);
});

// POST /api/units - Create new unit
router.post('/', async (req: AuthRequest, res) => {
  await unitController.create(req, res);
});

// PUT /api/units/:id - Update unit
router.put('/:id', async (req: AuthRequest, res) => {
  await unitController.update(req, res);
});

// DELETE /api/units/:id - Delete unit
router.delete('/:id', async (req: AuthRequest, res) => {
  await unitController.delete(req, res);
});

// PUT /api/units/:id/assign-tenant - Assign tenant to unit
router.put('/:id/assign-tenant', async (req: AuthRequest, res) => {
  await unitController.assignTenant(req, res);
});

// PUT /api/units/:id/remove-tenant - Remove tenant from unit
router.put('/:id/remove-tenant', async (req: AuthRequest, res) => {
  await unitController.removeTenant(req, res);
});

// POST /api/units/bulk-operations - Bulk operations on units
router.post('/bulk-operations', async (req: AuthRequest, res) => {
  await unitController.bulkOperations(req, res);
});

export default router; 