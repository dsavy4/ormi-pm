import { Context } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { PropertyHealthService } from '../services/PropertyHealthService';

export class PropertyController {
  /**
   * Get all properties
   */
  async getAll(c: Context) {
    try {
      const user = c.get('user') as any;
      const userId = user.id;
      const userRole = user.role;

      // Build where clause based on user role
      let whereClause: any = {};
      if (userRole !== 'ADMIN') {
        whereClause = { ownerId: userId };
      }

      const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
      
      // Build where clause for Supabase
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_managers (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (userRole !== 'ADMIN') {
        query = query.eq('owner_id', userId);
      }
      
      const { data: properties, error } = await query;
      
      if (error) {
        throw error;
      }

      // Return properties with existing health scores
      // Health is calculated automatically via triggers when data changes
      return c.json(properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      return c.json({ error: 'Failed to fetch properties' }, 500);
    }
  }

  /**
   * Get property by ID
   */
  async getById(c: Context) {
    try {
      const propertyId = c.req.param('id');
      const user = c.get('user') as any;
      const userId = user.id;
      const userRole = user.role;

      // Check if user has access to this property
      let whereClause: any = { id: propertyId };
      if (userRole !== 'ADMIN') {
        whereClause = { ...whereClause, ownerId: userId };
      }

      const property = await prisma.property.findUnique({
        where: whereClause,
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
          maintenanceRequests: {
            include: {
              unit: {
                select: {
                  id: true,
                  unitNumber: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!property) {
        return c.json({ error: 'Property not found' }, 404);
      }

      // Calculate property health score if not already calculated or if it's stale
      let propertyHealth = property.propertyHealth || 0;
      const lastCalculation = property.lastHealthCalculation;
      
      // Check if health calculation is stale (older than 24 hours)
      if (!lastCalculation || 
          new Date().getTime() - new Date(lastCalculation).getTime() > 24 * 60 * 60 * 1000) {
        try {
          await PropertyHealthService.updatePropertyHealth(propertyId);
          // Fetch updated property to get new health score
          const updatedProperty = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { propertyHealth: true }
          });
          if (updatedProperty) {
            propertyHealth = updatedProperty.propertyHealth || 0;
          }
        } catch (healthError) {
          console.warn('Failed to calculate property health, using existing score:', healthError);
        }
      }

      const enhancedProperty = {
        ...property,
        propertyHealth,
      };

      return c.json(enhancedProperty);
    } catch (error) {
      console.error('Error fetching property:', error);
      return c.json({ error: 'Failed to fetch property' }, 500);
    }
  }

  /**
   * Create new property
   */
  async create(c: Context) {
    try {
      const user = c.get('user') as any;
      const userId = user.id;
      const body = await c.req.json();

      const {
        name,
        address,
        city,
        state,
        zipCode,
        propertyType,
        yearBuilt,
        sqft,
        lotSize,
        unitSuite,
        country,
        ownershipType,
        rentDueDay,
        allowOnlinePayments,
        enableMaintenanceRequests,
        description,
        notes,
        amenities,
        tags,
        totalUnits,
        monthlyRent,
      } = body;

      // Basic validation
      if (!name || !address || !city || !state || !zipCode || !propertyType) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      const property = await prisma.property.create({
        data: {
          name,
          address,
          city,
          state,
          zipCode,
          propertyType,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
          sqft: sqft ? parseInt(sqft) : null,
          lotSize: lotSize ? parseFloat(lotSize) : null,
          unitSuite,
          country: country || 'United States',
          ownershipType,
          rentDueDay: rentDueDay ? parseInt(rentDueDay) : 1,
          allowOnlinePayments: !!allowOnlinePayments,
          enableMaintenanceRequests: enableMaintenanceRequests !== false,
          description,
          notes,
          amenities: amenities || [],
          tags: tags || [],
          totalUnits: totalUnits ? parseInt(totalUnits) : 0,
          monthlyRent: monthlyRent ? parseFloat(monthlyRent) : 0,
          ownerId: userId,
          // Optional parity fields
          neighborhood: (body as any).neighborhood || null,
          marketValue: (body as any).marketValue ? parseFloat((body as any).marketValue) : null,
          purchasePrice: (body as any).purchasePrice ? parseFloat((body as any).purchasePrice) : null,
          expenses: (body as any).expenses ? parseFloat((body as any).expenses) : null,
          purchaseDate: (body as any).purchaseDate ? new Date((body as any).purchaseDate) : null,
          // Manager assignment if provided
          propertyManagerId: (body as any).propertyManagerId || null,
        },
        include: {
          propertyManager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return c.json(property, 201);
    } catch (error) {
      console.error('Error creating property:', error);
      return c.json({ error: 'Failed to create property' }, 500);
    }
  }

  /**
   * Update property
   */
  async update(c: Context) {
    try {
      const propertyId = c.req.param('id');
      const user = c.get('user') as any;
      const userId = user.id;
      const userRole = user.role;
      const body = await c.req.json();

      // Check if user has access to this property
      let whereClause: any = { id: propertyId };
      if (userRole !== 'ADMIN') {
        whereClause = { ...whereClause, ownerId: userId };
      }

      const existingProperty = await prisma.property.findUnique({
        where: whereClause,
      });

      if (!existingProperty) {
        return c.json({ error: 'Property not found' }, 404);
      }

      const updateData: any = {
        ...body,
      };

      // Whitelist/normalize fields to avoid unexpected writes
      const allowedKeys = new Set([
        'name','address','city','state','zipCode','propertyType','yearBuilt','sqft','lotSize','unitSuite','country',
        'ownershipType','rentDueDay','allowOnlinePayments','enableMaintenanceRequests','description','notes','amenities','tags',
        'totalUnits','images','propertyManagerId','neighborhood','marketValue','purchasePrice','expenses','purchaseDate'
      ]);
      Object.keys(updateData).forEach((k) => { if (!allowedKeys.has(k)) delete updateData[k]; });

      if (typeof updateData.yearBuilt !== 'undefined') updateData.yearBuilt = updateData.yearBuilt ? parseInt(updateData.yearBuilt) : null;
      if (typeof updateData.sqft !== 'undefined') updateData.sqft = updateData.sqft ? parseInt(updateData.sqft) : null;
      if (typeof updateData.lotSize !== 'undefined') updateData.lotSize = updateData.lotSize ? parseFloat(updateData.lotSize) : null;
      if (typeof updateData.rentDueDay !== 'undefined') updateData.rentDueDay = parseInt(updateData.rentDueDay);
      if (typeof updateData.marketValue !== 'undefined') updateData.marketValue = updateData.marketValue ? parseFloat(updateData.marketValue) : null;
      if (typeof updateData.purchasePrice !== 'undefined') updateData.purchasePrice = updateData.purchasePrice ? parseFloat(updateData.purchasePrice) : null;
      if (typeof updateData.expenses !== 'undefined') updateData.expenses = updateData.expenses ? parseFloat(updateData.expenses) : null;
      if (typeof updateData.purchaseDate !== 'undefined') updateData.purchaseDate = updateData.purchaseDate ? new Date(updateData.purchaseDate) : null;

      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: updateData,
        include: {
          propertyManager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return c.json(updatedProperty);
    } catch (error) {
      console.error('Error updating property:', error);
      return c.json({ error: 'Failed to update property' }, 500);
    }
  }

  /**
   * Delete property
   */
  async delete(c: Context) {
    try {
      const propertyId = c.req.param('id');
      const user = c.get('user') as any;
      const userId = user.id;
      const userRole = user.role;

      // Check if user has access to this property
      let whereClause: any = { id: propertyId };
      if (userRole !== 'ADMIN') {
        whereClause = { ...whereClause, ownerId: userId };
      }

      const property = await prisma.property.findUnique({
        where: whereClause,
        include: {
          units: true,
          maintenanceRequests: true,
        },
      });

      if (!property) {
        return c.json({ error: 'Property not found' }, 404);
      }

      // Check if property has units or maintenance requests
      if (property.units && property.units.length > 0) {
        return c.json({ error: 'Cannot delete property with existing units' }, 400);
      }

      if (property.maintenanceRequests && property.maintenanceRequests.length > 0) {
        return c.json({ error: 'Cannot delete property with existing maintenance requests' }, 400);
      }

      await prisma.property.delete({
        where: { id: propertyId },
      });

      return c.json({ message: 'Property deleted successfully' });
    } catch (error) {
      console.error('Error deleting property:', error);
      return c.json({ error: 'Failed to delete property' }, 500);
    }
  }

  /**
   * Upload property image
   */
  async uploadImage(c: Context) {
    try {
      const propertyId = c.req.param('id');
      const user = c.get('user') as any;
      const userId = user.id;
      const formData = await c.req.formData();
      const imageFile = formData.get('image') as File;

      if (!imageFile) {
        return c.json({ error: 'No image file provided' }, 400);
      }

      // Check if property exists and user has access
      const property = await prisma.property.findUnique({
        where: { id: propertyId, ownerId: userId },
      });

      if (!property) {
        return c.json({ error: 'Property not found' }, 404);
      }

      // Import storage service dynamically
      const { createStorageService } = await import('../utils/storage');
      const storageService = createStorageService(process.env);

      // Convert File to Buffer for storage service
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { url, key } = await storageService.uploadFile(
        buffer,
        imageFile.name,
        imageFile.type,
        `properties/${propertyId}`
      );

      // Update property with image URL
      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: { images: { push: url } },
        include: {
          propertyManager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return c.json({
        imageUrl: url,
        imageKey: key,
        property: updatedProperty,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return c.json({ error: 'Failed to upload image' }, 500);
    }
  }

  /**
   * Generate upload URL for property image
   */
  async generateUploadUrl(c: Context) {
    try {
      const propertyId = c.req.param('id');
      const user = c.get('user') as any;
      const userId = user.id;
      const body = await c.req.json();
      const { fileName, contentType } = body;

      if (!fileName || !contentType) {
        return c.json({ error: 'Missing fileName or contentType' }, 400);
      }

      // Check if property exists and user has access
      const property = await prisma.property.findUnique({
        where: { id: propertyId, ownerId: userId },
      });

      if (!property) {
        return c.json({ error: 'Property not found' }, 404);
      }

      // Import storage service dynamically
      const { createStorageService } = await import('../utils/storage');
      const storageService = createStorageService(process.env);

      const { uploadUrl, key, publicUrl } = await storageService.generatePresignedUrl(
        fileName,
        contentType,
        `properties/${propertyId}/images`
      );

      return c.json({
        uploadUrl,
        key,
        publicUrl,
      });
    } catch (error) {
      console.error('Error generating upload URL:', error);
      return c.json({ error: 'Failed to generate upload URL' }, 500);
    }
  }

  /**
   * Bulk archive properties
   */
  async bulkArchive(c: Context) {
    try {
      const user = c.get('user') as any;
      const userId = user.id;
      const userRole = user.role;
      const body = await c.req.json();
      const { propertyIds } = body;

      if (!propertyIds || !Array.isArray(propertyIds)) {
        return c.json({ error: 'Invalid property IDs' }, 400);
      }

      // Check if user has access to all properties
      let whereClause: any = { id: { in: propertyIds } };
      if (userRole !== 'ADMIN') {
        whereClause = { ...whereClause, ownerId: userId };
      }

      const properties = await prisma.property.findMany({
        where: whereClause,
      });

      if (properties.length !== propertyIds.length) {
        return c.json({ error: 'Some properties not found or access denied' }, 400);
      }

      // Archive properties
      await prisma.property.updateMany({
        where: { id: { in: propertyIds } },
        data: { 
          status: 'ARCHIVED',
          isActive: false,
          updatedAt: new Date(),
        },
      });

      return c.json({ message: 'Properties archived successfully' });
    } catch (error) {
      console.error('Error archiving properties:', error);
      return c.json({ error: 'Failed to archive properties' }, 500);
    }
  }

  /**
   * Assign manager to property
   */
  async assignManager(c: Context) {
    try {
      const propertyId = c.req.param('id');
      const user = c.get('user') as any;
      const userId = user.id;
      const userRole = user.role;
      const body = await c.req.json();
      const { managerId } = body;

      if (!managerId) {
        return c.json({ error: 'Manager ID is required' }, 400);
      }

      // Check if user has access to this property
      let whereClause: any = { id: propertyId };
      if (userRole !== 'ADMIN') {
        whereClause = { ...whereClause, ownerId: userId };
      }

      const property = await prisma.property.findUnique({
        where: whereClause,
      });

      if (!property) {
        return c.json({ error: 'Property not found' }, 404);
      }

      // Check if manager exists and has appropriate role
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });

      if (!manager || !['PROPERTY_MANAGER', 'ASSISTANT_MANAGER'].includes(manager.role)) {
        return c.json({ error: 'Invalid manager or insufficient permissions' }, 400);
      }

      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: { 
          propertyManagerId: managerId,
          updatedAt: new Date(),
        },
        include: {
          propertyManager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return c.json(updatedProperty);
    } catch (error) {
      console.error('Error assigning manager:', error);
      return c.json({ error: 'Failed to assign manager' }, 500);
    }
  }

  /**
   * Get property insights
   */
  async getInsights(c: Context) {
    try {
      const propertyId = c.req.param('id');
      const user = c.get('user') as any;
      const userId = user.id;
      const userRole = user.role;

      // Check if user has access to this property
      let whereClause: any = { id: propertyId };
      if (userRole !== 'ADMIN') {
        whereClause = { ...whereClause, ownerId: userId };
      }

      const property = await prisma.property.findUnique({
        where: whereClause,
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
              maintenanceRequests: true,
            },
          },
          maintenanceRequests: true,
        },
      });

      if (!property) {
        return c.json({ error: 'Property not found' }, 404);
      }

      // Calculate insights
      const totalUnits = property.units.length;
      const occupiedUnits = property.units.filter(unit => unit.status === 'OCCUPIED').length;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      const totalRent = property.units.reduce((sum, unit) => {
        return sum + (unit.monthlyRent ? parseFloat(unit.monthlyRent.toString()) : 0);
      }, 0);

      const totalMaintenanceRequests = property.units.reduce((sum, unit) => {
        return sum + (unit.maintenanceRequests ? unit.maintenanceRequests.length : 0);
      }, 0);

      const openMaintenanceRequests = property.units.reduce((sum, unit) => {
        return sum + (unit.maintenanceRequests ? 
          unit.maintenanceRequests.filter(req => req.status === 'OPEN').length : 0);
      }, 0);

      const insights = {
        propertyId: property.id,
        propertyName: property.name,
        totalUnits,
        occupiedUnits,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        totalRent: Math.round(totalRent * 100) / 100,
        totalMaintenanceRequests,
        openMaintenanceRequests,
        propertyHealth: property.propertyHealth || 0,
        lastHealthCalculation: property.lastHealthCalculation,
        units: property.units.map(unit => ({
          id: unit.id,
          unitNumber: unit.unitNumber,
          status: unit.status,
          monthlyRent: unit.monthlyRent,
          tenant: unit.tenant,
          maintenanceRequests: unit.maintenanceRequests || [],
        })),
      };

      return c.json(insights);
    } catch (error) {
      console.error('Error fetching property insights:', error);
      return c.json({ error: 'Failed to fetch property insights' }, 500);
    }
  }
} 