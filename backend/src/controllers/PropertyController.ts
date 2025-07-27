import { Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { storageService } from '../utils/storage';

const prisma = new PrismaClient();

export class PropertyController {
  /**
   * Get all properties for authenticated user
   */
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const page = parseInt(req.query?.page as string) || 1;
      const limit = parseInt(req.query?.limit as string) || 10;
      const search = req.query?.search as string;
      const status = req.query?.status as string;
      const propertyType = req.query?.propertyType as string;
      const manager = req.query?.manager as string;

      let whereClause = {};
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        whereClause = { ownerId: userId };
      }

      // Add search filter
      if (search) {
        whereClause = {
          ...whereClause,
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      // Add status filter
      if (status) {
        whereClause = { ...whereClause, status };
      }

      // Add property type filter
      if (propertyType) {
        whereClause = { ...whereClause, propertyType };
      }

      // Add manager filter
      if (manager) {
        whereClause = { ...whereClause, propertyManagerId: manager };
      }

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where: whereClause,
          include: {
            units: {
              select: {
                id: true,
                unitNumber: true,
                status: true,
                monthlyRent: true,
              },
            },
            propertyManager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: { units: true },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.property.count({ where: whereClause }),
      ]);

      // Calculate additional metrics for each property
      const propertiesWithMetrics = properties.map(property => {
        const totalUnits = property.units.length;
        const occupiedUnits = property.units.filter(unit => unit.status === 'OCCUPIED').length;
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
        const monthlyRent = property.units.reduce((sum, unit) => sum + Number(unit.monthlyRent), 0);

        return {
          ...property,
          totalUnits,
          occupiedUnits,
          vacantUnits: totalUnits - occupiedUnits,
          occupancyRate,
          monthlyRent,
          avgRentPerUnit: totalUnits > 0 ? monthlyRent / totalUnits : 0,
        };
      });

      res.json({
        properties: propertiesWithMetrics,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({ error: 'Failed to fetch properties' });
    }
  }

  /**
   * Get property by ID
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const propertyId = req.params.id;

      // Check if property exists and user has permission
      let propertyWhere: any = { id: propertyId };
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        propertyWhere.ownerId = userId;
      }

      const property = await prisma.property.findUnique({
        where: propertyWhere,
        include: {
          units: {
            include: {
              tenant: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              payments: {
                where: {
                  status: 'PENDING',
                },
                orderBy: { dueDate: 'asc' },
              },
              maintenanceRequests: {
                where: {
                  status: { in: ['SUBMITTED', 'IN_PROGRESS'] },
                },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
                      propertyManager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
        },
      });

      if (!property) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      // Calculate metrics
      const totalUnits = property.units.length;
      const occupiedUnits = property.units.filter(unit => unit.leaseStatus === 'LEASED').length;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      const monthlyRent = property.units.reduce((sum, unit) => sum + Number(unit.monthlyRent), 0);
      const urgentMaintenanceRequests = property.units.reduce((sum, unit) => 
        sum + unit.maintenanceRequests.filter(req => req.priority === 'URGENT').length, 0
      );
      const leasesExpiringThisMonth = property.units.filter(unit => {
        if (!unit.leaseEnd) return false;
        const endDate = new Date(unit.leaseEnd);
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return endDate <= endOfMonth;
      }).length;

      const enhancedProperty = {
        ...property,
        totalUnits,
        occupiedUnits,
        vacantUnits: totalUnits - occupiedUnits,
        occupancyRate,
        monthlyRent,
        avgRentPerUnit: totalUnits > 0 ? monthlyRent / totalUnits : 0,
        urgentMaintenanceRequests,
        leasesExpiringThisMonth,
      };

      res.json(enhancedProperty);
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({ error: 'Failed to fetch property' });
    }
  }

  /**
   * Create new property
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const userId = req.user!.id;
      const {
        name,
        address,
        city,
        state,
        zipCode,
        propertyType,
        yearBuilt,
        description,
        notes,
        totalUnits,
        sqft,
        lotSize,
        amenities,
        tags,
        managerId,
        rentDueDay,
        allowOnlinePayments,
        enableMaintenanceRequests,
      } = req.body;

      const property = await prisma.property.create({
        data: {
          name,
          address,
          city,
          state,
          zipCode,
          propertyType,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
          description,
          notes,
          totalUnits: totalUnits ? parseInt(totalUnits) : 0,
          sqft: sqft ? parseInt(sqft) : null,
          lotSize: lotSize ? parseFloat(lotSize) : null,
          amenities: amenities || [],
          tags: tags || [],
          managerId,
          rentDueDay: rentDueDay ? parseInt(rentDueDay) : 1,
          allowOnlinePayments: allowOnlinePayments || false,
          enableMaintenanceRequests: enableMaintenanceRequests || true,
          ownerId: userId,
          status: 'ACTIVE',
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(property);
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({ error: 'Failed to create property' });
    }
  }

  /**
   * Update property
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const userId = req.user!.id;
      const propertyId = req.params.id;
      const updateData = req.body;

      // Check if property exists and user has permission
      const existingProperty = await prisma.property.findFirst({
        where: {
          id: propertyId,
          ownerId: userId,
        },
      });

      if (!existingProperty) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const property = await prisma.property.update({
        where: { id: propertyId },
        data: updateData,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.json(property);
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({ error: 'Failed to update property' });
    }
  }

  /**
   * Delete property
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const userId = req.user!.id;
      const propertyId = req.params.id;

      // Check if property exists and user has permission
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          ownerId: userId,
        },
      });

      if (!property) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      // Check if property has units
      const unitCount = await prisma.unit.count({
        where: { propertyId },
      });

      if (unitCount > 0) {
        res.status(400).json({ error: 'Cannot delete property with existing units' });
        return;
      }

      await prisma.property.delete({
        where: { id: propertyId },
      });

      res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({ error: 'Failed to delete property' });
    }
  }

  /**
   * Upload image for property
   */
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const propertyId = req.params.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      // Check if property exists and user has permission
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          ownerId: userId,
        },
      });

      if (!property) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      // Upload to Cloudflare R2
      const { url, key } = await storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        `properties/${propertyId}`
      );

      // Update property with new image URL
      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: {
          images: {
            push: url,
          },
        },
      });

      res.json({ 
        imageUrl: url,
        key: key,
        property: updatedProperty,
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  /**
   * Generate presigned URL for direct upload
   */
  async generateUploadUrl(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const propertyId = req.params.id;
      const { fileName, contentType } = req.body;

      if (!fileName || !contentType) {
        res.status(400).json({ error: 'File name and content type are required' });
        return;
      }

      // Check if property exists and user has permission
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          ownerId: userId,
        },
      });

      if (!property) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      // Generate presigned URL
      const { uploadUrl, key, publicUrl } = await storageService.generatePresignedUrl(
        fileName,
        contentType,
        `properties/${propertyId}`
      );

      res.json({
        uploadUrl,
        key,
        publicUrl,
        expiresIn: 3600, // 1 hour
      });
    } catch (error) {
      console.error('Generate upload URL error:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  }

  /**
   * Bulk archive properties
   */
  async bulkArchive(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { propertyIds } = req.body;

      if (!propertyIds || !Array.isArray(propertyIds)) {
        res.status(400).json({ error: 'Property IDs array is required' });
        return;
      }

      // Check if all properties belong to user
      const properties = await prisma.property.findMany({
        where: {
          id: { in: propertyIds },
          ownerId: userId,
        },
      });

      if (properties.length !== propertyIds.length) {
        res.status(400).json({ error: 'Some properties not found or access denied' });
        return;
      }

      // Archive properties
      await prisma.property.updateMany({
        where: {
          id: { in: propertyIds },
          ownerId: userId,
        },
        data: {
          status: 'ARCHIVED',
          archivedAt: new Date(),
          archivedBy: userId,
        },
      });

      res.json({ 
        message: `${properties.length} properties archived successfully`,
        archivedCount: properties.length,
      });
    } catch (error) {
      console.error('Bulk archive error:', error);
      res.status(500).json({ error: 'Failed to archive properties' });
    }
  }

  /**
   * Assign manager to properties
   */
  async assignManager(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { propertyIds, managerId } = req.body;

      if (!propertyIds || !Array.isArray(propertyIds) || !managerId) {
        res.status(400).json({ error: 'Property IDs array and manager ID are required' });
        return;
      }

      // Check if manager exists
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });

      if (!manager || manager.role !== 'MANAGER') {
        res.status(400).json({ error: 'Invalid manager ID' });
        return;
      }

      // Check if all properties belong to user
      const properties = await prisma.property.findMany({
        where: {
          id: { in: propertyIds },
          ownerId: userId,
        },
      });

      if (properties.length !== propertyIds.length) {
        res.status(400).json({ error: 'Some properties not found or access denied' });
        return;
      }

      // Assign manager to properties
      await prisma.property.updateMany({
        where: {
          id: { in: propertyIds },
          ownerId: userId,
        },
        data: {
          managerId,
        },
      });

      res.json({ 
        message: `Manager assigned to ${properties.length} properties successfully`,
        assignedCount: properties.length,
      });
    } catch (error) {
      console.error('Assign manager error:', error);
      res.status(500).json({ error: 'Failed to assign manager' });
    }
  }

  /**
   * Get property insights
   */
  async getInsights(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const [
        totalProperties,
        totalUnits,
        properties,
        recentActivity,
      ] = await Promise.all([
        prisma.property.count({ where: { ownerId: userId } }),
        prisma.unit.count({
          where: {
            property: { ownerId: userId },
          },
        }),
        prisma.property.findMany({
          where: { ownerId: userId },
          include: {
            units: {
              select: {
                leaseStatus: true,
                monthlyRent: true,
              },
            },
            _count: {
              select: { units: true },
            },
          },
        }),
        prisma.maintenanceRequest.findMany({
          where: {
            unit: {
              property: { ownerId: userId },
            },
          },
          include: {
            unit: {
              select: {
                property: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      // Calculate insights
      const occupiedUnits = properties.reduce((sum, property) => 
        sum + property.units.filter(unit => unit.leaseStatus === 'LEASED').length, 0
      );
      const totalMonthlyIncome = properties.reduce((sum, property) => 
        sum + property.units.reduce((unitSum, unit) => unitSum + Number(unit.monthlyRent), 0), 0
      );
      const avgOccupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      // Find top performing property
      const propertyPerformance = properties.map(property => {
        const propertyUnits = property.units.length;
        const propertyOccupied = property.units.filter(unit => unit.leaseStatus === 'LEASED').length;
        const propertyIncome = property.units.reduce((sum, unit) => sum + Number(unit.monthlyRent), 0);
        const occupancyRate = propertyUnits > 0 ? (propertyOccupied / propertyUnits) * 100 : 0;

        return {
          ...property,
          occupancyRate,
          monthlyIncome: propertyIncome,
        };
      });

      const topPerformingProperty = propertyPerformance.reduce((top, current) => 
        current.monthlyIncome > top.monthlyIncome ? current : top
      );

      const insights = {
        totalProperties,
        totalUnits,
        totalMonthlyIncome,
        avgOccupancyRate,
        leasesExpiringThisMonth: 0, // TODO: Calculate based on lease end dates
        urgentMaintenanceCount: recentActivity.filter(req => req.priority === 'URGENT').length,
        topPerformingProperty,
        lowPerformingProperties: propertyPerformance
          .filter(p => p.occupancyRate < 70)
          .slice(0, 5),
        recentActivity,
      };

      res.json(insights);
    } catch (error) {
      console.error('Get insights error:', error);
      res.status(500).json({ error: 'Failed to fetch insights' });
    }
  }
} 