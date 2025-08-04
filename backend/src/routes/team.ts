import { Hono } from 'hono';
import { TeamMemberController } from '../controllers/TeamMemberController';

const app = new Hono();
const teamController = new TeamMemberController();

// Note: Authentication middleware will be applied in worker-server.ts

// Get all team members
app.get('/', (c) => teamController.getAll(c));

// Get team member by ID
app.get('/:id', (c) => teamController.getById(c));

// Create new team member
app.post('/', (c) => teamController.create(c));

// Update team member
app.put('/:id', (c) => teamController.update(c));

// Delete/deactivate team member
app.delete('/:id', (c) => teamController.delete(c));

// Assign properties to team member
app.post('/:id/assign-properties', (c) => teamController.assignProperties(c));

// Get team member performance analytics
app.get('/:id/performance', (c) => teamController.getPerformance(c));

// Upload team member avatar
app.post('/:id/avatar', (c) => teamController.uploadAvatar(c));

// Generate presigned URL for avatar upload
app.post('/:id/avatar/upload-url', (c) => teamController.generateAvatarUploadUrl(c));

// Bulk operations
app.post('/bulk/assign-properties', (c) => teamController.bulkAssignProperties(c));
app.post('/bulk/update-status', (c) => teamController.bulkUpdateStatus(c));
app.post('/bulk/update-role', (c) => teamController.bulkUpdateRole(c));

// Import/Export
app.post('/import', (c) => teamController.importTeamMembers(c));
app.get('/export', (c) => teamController.exportTeamMembers(c));

// Team analytics
app.get('/analytics/overview', (c) => teamController.getTeamAnalytics(c));
app.get('/analytics/performance', (c) => teamController.getPerformanceAnalytics(c));
app.get('/analytics/storage', (c) => teamController.getStorageAnalytics(c));

// Team templates
app.get('/templates', (c) => teamController.getTemplates(c));
app.post('/templates', (c) => teamController.createTemplate(c));
app.put('/templates/:id', (c) => teamController.updateTemplate(c));
app.delete('/templates/:id', (c) => teamController.deleteTemplate(c));

export default app; 