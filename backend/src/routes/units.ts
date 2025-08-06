import { Hono } from 'hono';
import { UnitController } from '../controllers/UnitController';

const units = new Hono();

// Get all units for a specific property
units.get('/property/:propertyId', UnitController.getUnitsByProperty);

// Get unit details by ID
units.get('/:unitId/details', UnitController.getUnitDetails);

// Get bulk unit details by array of IDs
units.post('/bulk-details', UnitController.getBulkUnitDetails);

export default units; 