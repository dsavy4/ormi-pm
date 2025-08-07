import { Router } from 'express';
import { body, query, param } from 'express-validator';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { PropertyController } from '../controllers/PropertyController';
import { UnitController } from '../controllers/UnitController';

const router = Router();
const propertyController = new PropertyController();
const unitController = new UnitController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticateToken);

// GET /api/properties - Get all properties
router.get('/', 
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isString(),
  query('propertyType').optional().isString(),
  query('manager').optional().isString(),
  propertyController.getAll
);

// GET /api/properties/insights - Get property insights
router.get('/insights', propertyController.getInsights);

// GET /api/properties/:propertyId/units - Get units for a specific property
router.get('/:propertyId/units', 
  param('propertyId').notEmpty().withMessage('Property ID is required'),
  UnitController.getUnitsByProperty
);

// GET /api/properties/:id - Get property by ID (must come after more specific routes)
router.get('/:id', 
  param('id').notEmpty().withMessage('Property ID is required'),
  (req, res) => {
    console.log(`[DEBUG] Property route hit - ID: ${req.params.id}`);
    propertyController.getById(req, res);
  }
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
  body('propertyType').optional().isString(),
  body('yearBuilt').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
  body('totalUnits').optional().isInt({ min: 0 }),
  body('sqft').optional().isInt({ min: 0 }),
  body('lotSize').optional().isFloat({ min: 0 }),
  body('amenities').optional().isArray(),
  body('tags').optional().isArray(),
  body('managerId').optional().isUUID(),
  body('rentDueDay').optional().isInt({ min: 1, max: 31 }),
  body('allowOnlinePayments').optional().isBoolean(),
  body('enableMaintenanceRequests').optional().isBoolean(),
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
  body('propertyType').optional().isString(),
  body('yearBuilt').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
  body('totalUnits').optional().isInt({ min: 0 }),
  body('sqft').optional().isInt({ min: 0 }),
  body('lotSize').optional().isFloat({ min: 0 }),
  body('amenities').optional().isArray(),
  body('tags').optional().isArray(),
  body('managerId').optional().isUUID(),
  body('rentDueDay').optional().isInt({ min: 1, max: 31 }),
  body('allowOnlinePayments').optional().isBoolean(),
  body('enableMaintenanceRequests').optional().isBoolean(),
], propertyController.update);

// DELETE /api/properties/:id - Delete property
router.delete('/:id',
  param('id').isUUID(),
  propertyController.delete
);

// POST /api/properties/:id/images - Upload property image
router.post('/:id/images',
  param('id').isUUID(),
  upload.single('image'),
  propertyController.uploadImage
);

// POST /api/properties/:id/upload-url - Generate presigned URL for direct upload
router.post('/:id/upload-url', [
  param('id').isUUID(),
  body('fileName').notEmpty().withMessage('File name is required'),
  body('contentType').notEmpty().withMessage('Content type is required'),
], propertyController.generateUploadUrl);

// POST /api/properties/bulk-archive - Bulk archive properties
router.post('/bulk-archive', [
  body('propertyIds').isArray({ min: 1 }).withMessage('Property IDs array is required'),
  body('propertyIds.*').isUUID().withMessage('Invalid property ID'),
], propertyController.bulkArchive);

// POST /api/properties/assign-manager - Assign manager to properties
router.post('/assign-manager', [
  body('propertyIds').isArray({ min: 1 }).withMessage('Property IDs array is required'),
  body('propertyIds.*').isUUID().withMessage('Invalid property ID'),
  body('managerId').isUUID().withMessage('Manager ID is required'),
], propertyController.assignManager);

export default router; 