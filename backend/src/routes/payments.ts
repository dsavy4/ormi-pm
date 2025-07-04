import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/payments - Get payments
router.get('/', (req: AuthRequest, res) => {
  res.json({ message: 'Payments route working', user: req.user });
});

export default router; 