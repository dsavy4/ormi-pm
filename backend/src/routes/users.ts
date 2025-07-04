import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users - Get user profile
router.get('/profile', (req: AuthRequest, res) => {
  res.json({ message: 'Users route working', user: req.user });
});

export default router; 