import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/reports - Get reports
router.get('/', (req: AuthRequest, res) => {
  res.json({ message: 'Reports route working', user: req.user });
});

export default router; 