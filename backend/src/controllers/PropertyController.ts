import { Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

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

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where: whereClause,
          include: {
            units: {
              select: {
                id: true,
                unitNumber: true,
                leaseStatus: true,
                monthlyRent: true,
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

      res.json({
        properties,
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
                  phoneNumber: true,
                },
              },
              payments: {
                where: { status: 'PENDING' },
                orderBy: { dueDate: 'asc' },
                take: 3,
              },
            },
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!property) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      res.json(property);
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
        totalUnits,
        yearBuilt,
        squareFootage,
        lotSize,
        parkingSpaces,
        amenities,
        notes,
      } = req.body;

      const property = await prisma.property.create({
        data: {
          name,
          address,
          city,
          state,
          zipCode,
          description: notes,
          notes,
          ownerId: userId,
        },
        include: {
          units: true,
          _count: {
            select: { units: true },
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
      const userRole = req.user!.role;
      const propertyId = req.params.id;

      // Check if property exists and user has permission
      let propertyWhere: any = { id: propertyId };
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        propertyWhere.ownerId = userId;
      }

      const existingProperty = await prisma.property.findUnique({
        where: propertyWhere,
      });

      if (!existingProperty) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      const {
        name,
        address,
        city,
        state,
        zipCode,
        description,
        notes,
      } = req.body;

      const property = await prisma.property.update({
        where: { id: propertyId },
        data: {
          name,
          address,
          city,
          state,
          zipCode,
          description,
          notes,
        },
        include: {
          units: true,
          _count: {
            select: { units: true },
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
      const userRole = req.user!.role;
      const propertyId = req.params.id;

      // Check if property exists and user has permission
      let propertyWhere: any = { id: propertyId };
      if (userRole === 'ADMIN' || userRole === 'MANAGER') {
        propertyWhere.ownerId = userId;
      }

      const existingProperty = await prisma.property.findUnique({
        where: propertyWhere,
        include: {
          units: true,
        },
      });

      if (!existingProperty) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      // Check if property has units
      if (existingProperty.units.length > 0) {
        res.status(400).json({ 
          error: 'Cannot delete property with existing units. Please remove all units first.' 
        });
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
} 