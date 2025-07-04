import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/units - Get units
router.get('/', (req: AuthRequest, res) => {
  res.json({ message: 'Units route working', user: req.user });
});

export default router; 