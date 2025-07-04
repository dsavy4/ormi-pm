import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { PropertyController } from '../controllers/PropertyController';

const router = Router();
const propertyController = new PropertyController();

// All routes require authentication
router.use(authenticateToken);

// GET /api/properties - Get all properties
router.get('/', 
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  propertyController.getAll
);

// GET /api/properties/:id - Get property by ID
router.get('/:id', 
  param('id').isUUID(),
  propertyController.getById
);

// POST /api/properties - Create new property
router.post('/', [
  body('name').notEmpty().withMessage('Property name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zipCode').notEmpty().withMessage('ZIP code is required'),
  body('description').optional().isString(),
  body('notes').optional().isString(),
], propertyController.create);

// PUT /api/properties/:id - Update property
router.put('/:id', [
  param('id').isUUID(),
  body('name').optional().notEmpty(),
  body('address').optional().notEmpty(),
  body('city').optional().notEmpty(),
  body('state').optional().notEmpty(),
  body('zipCode').optional().notEmpty(),
  body('description').optional().isString(),
  body('notes').optional().isString(),
], propertyController.update);

// DELETE /api/properties/:id - Delete property
router.delete('/:id',
  param('id').isUUID(),
  propertyController.delete
);

export default router; 