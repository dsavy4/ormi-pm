import { PrismaClient } from '@prisma/client';
import { Context } from 'hono';

const prisma = new PrismaClient();

export class UnitController {
  // Get all units for a specific property
  static async getUnitsByProperty(c: Context) {
    try {
      const propertyId = c.req.param('propertyId');
      
      if (!propertyId) {
        return c.json({ error: 'Property ID is required' }, 400);
      }

      const units = await prisma.unit.findMany({
        where: {
          propertyId: propertyId,
          isActive: true
        },
        include: {
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true
            }
          },
          property: {
            select: {
              id: true,
              name: true
            }
          },
          payments: {
            where: {
              status: 'PAID'
            },
            orderBy: {
              paymentDate: 'desc'
            },
            take: 1
          },
          maintenanceRequests: {
            where: {
              status: {
                in: ['SUBMITTED', 'IN_PROGRESS']
              }
            }
          }
        },
        orderBy: {
          unitNumber: 'asc'
        }
      });

      // Transform the data to match frontend expectations
      const transformedUnits = units.map(unit => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        squareFootage: unit.squareFootage,
        monthlyRent: parseFloat(unit.monthlyRent.toString()),
        status: unit.status.toLowerCase(),
        amenities: unit.amenities || [],
        createdAt: unit.createdAt.toISOString(),
        tenant: unit.tenant ? {
          id: unit.tenant.id,
          firstName: unit.tenant.firstName,
          lastName: unit.tenant.lastName,
          email: unit.tenant.email,
          phoneNumber: unit.tenant.phoneNumber || ''
        } : null,
        lastPayment: unit.payments[0] ? {
          date: unit.payments[0].paymentDate?.toISOString().split('T')[0],
          amount: parseFloat(unit.payments[0].amount.toString())
        } : null,
        openMaintenanceRequests: unit.maintenanceRequests.length
      }));

      return c.json({
        success: true,
        data: transformedUnits,
        total: transformedUnits.length
      });

    } catch (error) {
      console.error('Error fetching units:', error);
      return c.json({ error: 'Failed to fetch units' }, 500);
    }
  }

  // Get unit details by ID (single unit)
  static async getUnitDetails(c: Context) {
    try {
      const unitId = c.req.param('unitId');
      
      if (!unitId) {
        return c.json({ error: 'Unit ID is required' }, 400);
      }

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId
        },
        include: {
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true
            }
          },
          payments: {
            orderBy: {
              paymentDate: 'desc'
            },
            take: 10
          },
          maintenanceRequests: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          }
        }
      });

      if (!unit) {
        return c.json({ error: 'Unit not found' }, 404);
      }

      // Transform to match frontend expectations
      const unitDetails = {
        lastPayment: unit.payments[0] ? {
          date: unit.payments[0].paymentDate?.toISOString().split('T')[0],
          amount: parseFloat(unit.payments[0].amount.toString())
        } : null,
        paymentHistory: unit.payments.map(payment => ({
          date: payment.paymentDate?.toISOString().split('T')[0],
          amount: parseFloat(payment.amount.toString()),
          status: payment.status.toLowerCase()
        })),
        maintenanceRequests: unit.maintenanceRequests.map(request => ({
          id: request.id,
          title: request.title,
          status: request.status.toLowerCase(),
          date: request.createdAt.toISOString().split('T')[0]
        })),
        lastMaintenance: unit.maintenanceRequests[0] ? {
          date: unit.maintenanceRequests[0].createdAt.toISOString().split('T')[0],
          description: unit.maintenanceRequests[0].description
        } : null,
        nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      };

      return c.json({
        success: true,
        data: unitDetails
      });

    } catch (error) {
      console.error('Error fetching unit details:', error);
      return c.json({ error: 'Failed to fetch unit details' }, 500);
    }
  }

  // Get bulk unit details by array of IDs
  static async getBulkUnitDetails(c: Context) {
    try {
      const body = await c.req.json();
      const { unitIds } = body;
      
      if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
        return c.json({ error: 'Unit IDs array is required' }, 400);
      }

      // Limit to prevent abuse
      if (unitIds.length > 50) {
        return c.json({ error: 'Maximum 50 units can be requested at once' }, 400);
      }

      const units = await prisma.unit.findMany({
        where: {
          id: {
            in: unitIds
          }
        },
        include: {
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true
            }
          },
          payments: {
            orderBy: {
              paymentDate: 'desc'
            },
            take: 5 // Reduced for bulk requests
          },
          maintenanceRequests: {
            where: {
              status: {
                in: ['SUBMITTED', 'IN_PROGRESS']
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 3 // Reduced for bulk requests
          }
        }
      });

      // Transform to match frontend expectations
      const unitDetailsMap = units.reduce((acc, unit) => {
        acc[unit.id] = {
          lastPayment: unit.payments[0] ? {
            date: unit.payments[0].paymentDate?.toISOString().split('T')[0],
            amount: parseFloat(unit.payments[0].amount.toString())
          } : null,
          paymentHistory: unit.payments.map(payment => ({
            date: payment.paymentDate?.toISOString().split('T')[0],
            amount: parseFloat(payment.amount.toString()),
            status: payment.status.toLowerCase()
          })),
          maintenanceRequests: unit.maintenanceRequests.map(request => ({
            id: request.id,
            title: request.title,
            status: request.status.toLowerCase(),
            date: request.createdAt.toISOString().split('T')[0]
          })),
          lastMaintenance: unit.maintenanceRequests[0] ? {
            date: unit.maintenanceRequests[0].createdAt.toISOString().split('T')[0],
            description: unit.maintenanceRequests[0].description
          } : null,
          nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        };
        return acc;
      }, {} as Record<string, any>);

      return c.json({
        success: true,
        data: unitDetailsMap
      });

    } catch (error) {
      console.error('Error fetching bulk unit details:', error);
      return c.json({ error: 'Failed to fetch unit details' }, 500);
    }
  }
} 