import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class DashboardController {
  /**
   * Get dashboard overview metrics
   */
  async getOverview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Build where clause based on user role
      let whereClause = {};
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        whereClause = { ownerId: userId };
      }

      // Get basic counts
      const [
        totalProperties,
        totalUnits,
        activeLeases,
        totalTenants,
        upcomingPayments,
        overduePayments,
        openMaintenanceRequests,
        monthlyRevenue,
      ] = await Promise.all([
        // Total properties
        prisma.property.count({
          where: whereClause,
        }),

        // Total units
        prisma.unit.count({
          where: {
            property: whereClause,
          },
        }),

        // Active leases
        prisma.unit.count({
          where: {
            property: whereClause,
            status: 'OCCUPIED',
          },
        }),

        // Total tenants
        prisma.user.count({
          where: {
            role: 'TENANT',
            units: {
              some: {
                property: whereClause,
              },
            },
          },
        }),

        // Upcoming rent payments (next 7 days)
        prisma.payment.count({
          where: {
            unit: {
              property: whereClause,
            },
            status: 'PENDING',
            dueDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Overdue payments
        prisma.payment.count({
          where: {
            unit: {
              property: whereClause,
            },
            status: 'PENDING',
            dueDate: {
              lt: new Date(),
            },
          },
        }),

        // Open maintenance requests
        prisma.maintenanceRequest.count({
          where: {
            unit: {
              property: whereClause,
            },
            status: {
              in: ['SUBMITTED', 'IN_PROGRESS'],
            },
          },
        }),

        // Monthly revenue (current month)
        prisma.payment.aggregate({
          where: {
            unit: {
              property: whereClause,
            },
            status: 'PAID',
            paymentDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      const monthlyRevenueAmount = monthlyRevenue._sum.amount ? Number(monthlyRevenue._sum.amount) : 0;
      
      res.json({
        totalProperties,
        totalUnits,
        activeLeases,
        totalTenants,
        upcomingRentPayments: upcomingPayments,
        overdueRents: overduePayments,
        openMaintenanceRequests,
        monthlyRevenue: isNaN(monthlyRevenueAmount) ? 0 : monthlyRevenueAmount,
      });
    } catch (error) {
      console.error('Dashboard overview error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard overview' });
    }
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Build where clause based on user role
      let whereClause = {};
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        whereClause = { ownerId: userId };
      }

      // Get recent activity (auditLog not implemented yet)
      const recentActivity: any[] = [];

      res.json(recentActivity);
    } catch (error) {
      console.error('Recent activity error:', error);
      res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
  }

  /**
   * Get upcoming rent payments
   */
  async getUpcomingPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const days = parseInt(req.query.days as string) || 7;

      // Build where clause based on user role
      let whereClause = {};
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        whereClause = { ownerId: userId };
      }

      const upcomingPayments = await prisma.payment.findMany({
        where: {
          unit: {
            property: whereClause,
          },
          status: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
        include: {
          unit: {
            include: {
              property: {
                select: {
                  name: true,
                  address: true,
                },
              },
            },
          },
          tenant: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      });

      res.json(upcomingPayments);
    } catch (error) {
      console.error('Upcoming payments error:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming payments' });
    }
  }

  /**
   * Get maintenance requests summary
   */
  async getMaintenanceSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      // Build where clause based on user role
      let whereClause = {};
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        whereClause = { ownerId: userId };
      }

      const [statusCounts, priorityCounts, recentRequests] = await Promise.all([
        // Count by status
        prisma.maintenanceRequest.groupBy({
          by: ['status'],
          where: {
            unit: {
              property: whereClause,
            },
          },
          _count: {
            status: true,
          },
        }),

        // Count by priority
        prisma.maintenanceRequest.groupBy({
          by: ['priority'],
          where: {
            unit: {
              property: whereClause,
            },
            status: {
              in: ['SUBMITTED', 'IN_PROGRESS'],
            },
          },
          _count: {
            priority: true,
          },
        }),

        // Recent requests
        prisma.maintenanceRequest.findMany({
          where: {
            unit: {
              property: whereClause,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            unit: {
              include: {
                property: {
                  select: {
                    name: true,
                    address: true,
                  },
                },
              },
            },
            tenant: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      ]);

      res.json({
        statusCounts,
        priorityCounts,
        recentRequests,
      });
    } catch (error) {
      console.error('Maintenance summary error:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance summary' });
    }
  }
} 