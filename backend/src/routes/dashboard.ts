import express from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireManager } from '../middleware/auth';

const router = express.Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProperties:
 *                   type: number
 *                 totalUnits:
 *                   type: number
 *                 activeLeases:
 *                   type: number
 *                 totalTenants:
 *                   type: number
 *                 upcomingRentPayments:
 *                   type: number
 *                 overdueRents:
 *                   type: number
 *                 openMaintenanceRequests:
 *                   type: number
 *                 monthlyRevenue:
 *                   type: number
 */
router.get('/overview', authenticateToken, requireManager, asyncHandler(dashboardController.getOverview));

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity feed
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity data
 */
router.get('/recent-activity', authenticateToken, requireManager, asyncHandler(dashboardController.getRecentActivity));

/**
 * @swagger
 * /api/dashboard/upcoming-payments:
 *   get:
 *     summary: Get upcoming rent payments
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: days
 *         in: query
 *         description: Number of days to look ahead
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Upcoming payments data
 */
router.get('/upcoming-payments', authenticateToken, requireManager, asyncHandler(dashboardController.getUpcomingPayments));

/**
 * @swagger
 * /api/dashboard/maintenance-summary:
 *   get:
 *     summary: Get maintenance requests summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Maintenance summary data
 */
router.get('/maintenance-summary', authenticateToken, requireManager, asyncHandler(dashboardController.getMaintenanceSummary));

export default router; 