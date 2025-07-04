import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/maintenance - Get maintenance requests
router.get('/', (req: AuthRequest, res) => {
  res.json({ message: 'Maintenance route working', user: req.user });
});

export default router; 