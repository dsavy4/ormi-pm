import { Request, Response } from 'express';
import { getSupabaseClient } from '../utils/supabase';
import { AuthRequest } from '../middleware/auth';
import { storageService } from '../utils/storage';

export class UnitController {
  /**
   * Get all units for a property
   */
  async getByPropertyId(req: AuthRequest, res: Response) {
    try {
      const supabase = getSupabaseClient(process.env);
      const user = req.user as any;
      const propertyId = req.params.propertyId;
      
      // Verify user owns the property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id, name, address, city, state, zipCode, propertyType, totalUnits, monthlyRent, propertyManagerId')
        .eq('id', propertyId)
        .eq('owner_id', user.userId)
        .single();
      
      if (propertyError || !property) {
        return res.status(404).json({ error: 'Property not found or access denied' });
      }
      
      const { data: units, error } = await supabase
        .from('units')
        .select(`
          *,
          tenant:users!units_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          property:properties!units_property_id_fkey (
            id,
            name,
            address,
            city,
            state,
            zipCode,
            propertyType,
            totalUnits,
            monthlyRent,
            propertyManagerId
          ),
          payments (
            id,
            amount,
            due_date,
            status,
            payment_date
          ),
          maintenance_requests (
            id,
            title,
            description,
            status,
            priority,
            created_at
          )
        `)
        .eq('property_id', propertyId)
        .order('unit_number');
      
      if (error) {
        console.error('Units fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch units' });
      }
      
      return res.json(units || []);
      
    } catch (error) {
      console.error('Units fetch error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get single unit by ID
   */
  async getById(req: AuthRequest, res: Response) {
    try {
      const supabase = getSupabaseClient(process.env);
      const user = req.user as any;
      const unitId = req.params.id;
      
      const { data: unit, error } = await supabase
        .from('units')
        .select(`
          *,
          tenant:users!units_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone_number
          ),
          property:properties!units_property_id_fkey (
            id,
            name,
            address,
            city,
            state,
            zipCode,
            propertyType,
            totalUnits,
            monthlyRent,
            propertyManagerId,
            owner_id
          ),
          payments (
            id,
            amount,
            due_date,
            status,
            payment_date,
            method
          ),
          maintenance_requests (
            id,
            title,
            description,
            status,
            priority,
            created_at
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (error || !unit) {
        return res.status(404).json({ error: 'Unit not found' });
      }
      
      // Verify user owns the property
      if (unit.property.owner_id !== user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      return res.json(unit);
      
    } catch (error) {
      console.error('Unit fetch error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create a new unit for a property
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const supabase = getSupabaseClient(process.env);
      const user = req.user as any;
      const body = req.body;
      
      const { 
        propertyId, unitNumber, bedrooms, bathrooms, squareFootage, monthlyRent, floor, 
        amenities, notes, unitType, status, balcony, parking, storageUnit, 
        securityDeposit, petDeposit, applicationFee, leaseTerms, appliances,
        furnished, smartHome, description, images, availableDate, showOnWebsite
      } = body;
      
      // Validate required fields
      if (!propertyId || !unitNumber || bedrooms === undefined || bathrooms === undefined || !squareFootage || !monthlyRent) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Verify user owns the property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id, name, totalUnits, occupiedUnits, isActive')
        .eq('id', propertyId)
        .eq('owner_id', user.userId)
        .single();
      
      if (propertyError || !property) {
        return res.status(404).json({ error: 'Property not found or access denied' });
      }
      
      // Validate property status
      if (!property.isActive) {
        return res.status(400).json({ error: 'Cannot add units to inactive property' });
      }
      
      // Check property capacity
      if (property.occupiedUnits >= property.totalUnits) {
        return res.status(400).json({ error: 'Property is at maximum capacity' });
      }
      
      // Check if unit number already exists for this property
      const { data: existingUnit, error: checkError } = await supabase
        .from('units')
        .select('id')
        .eq('property_id', propertyId)
        .eq('unit_number', unitNumber)
        .single();
      
      if (existingUnit) {
        return res.status(400).json({ error: 'Unit number already exists for this property' });
      }
      
      // Create the unit with property inheritance
      const { data: unit, error } = await supabase
        .from('units')
        .insert({
          unit_number: unitNumber,
          property_id: propertyId,
          unit_type: unitType || 'apartment',
          bedrooms: parseInt(bedrooms) || 0,
          bathrooms: parseFloat(bathrooms) || 1,
          square_footage: parseInt(squareFootage),
          monthly_rent: parseFloat(monthlyRent),
          security_deposit: securityDeposit ? parseFloat(securityDeposit) : 0,
          pet_deposit: petDeposit ? parseFloat(petDeposit) : 0,
          application_fee: applicationFee ? parseFloat(applicationFee) : 0,
          floor: floor ? parseInt(floor) : null,
          amenities: amenities || [],
          appliances: appliances || [],
          notes: notes || '',
          description: description || '',
          status: status || 'VACANT',
          lease_terms: leaseTerms || '12_months',
          balcony: balcony || false,
          parking: parking || false,
          storage_unit: storageUnit || false,
          furnished: furnished || false,
          smart_home: smartHome || false,
          images: images || [],
          available_date: availableDate || null,
          show_on_website: showOnWebsite !== undefined ? showOnWebsite : true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Unit creation error:', error);
        return res.status(500).json({ error: 'Failed to create unit' });
      }
      
      return res.status(201).json(unit);
      
    } catch (error) {
      console.error('Unit creation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update a unit
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const supabase = getSupabaseClient(process.env);
      const user = req.user as any;
      const unitId = req.params.id;
      const body = req.body;
      
      // Get the unit to verify ownership
      const { data: existingUnit, error: fetchError } = await supabase
        .from('units')
        .select(`
          *,
          property:properties!units_property_id_fkey (
            id,
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (fetchError || !existingUnit) {
        return res.status(404).json({ error: 'Unit not found' });
      }
      
      // Verify user owns the property
      if (existingUnit.property.owner_id !== user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Update the unit
      const { data: unit, error } = await supabase
        .from('units')
        .update({
          unit_number: body.unitNumber || existingUnit.unit_number,
          bedrooms: body.bedrooms ? parseInt(body.bedrooms) : existingUnit.bedrooms,
          bathrooms: body.bathrooms ? parseInt(body.bathrooms) : existingUnit.bathrooms,
          square_footage: body.squareFootage ? parseInt(body.squareFootage) : existingUnit.square_footage,
          monthly_rent: body.monthlyRent ? parseFloat(body.monthlyRent) : existingUnit.monthly_rent,
          floor: body.floor ? parseInt(body.floor) : existingUnit.floor,
          amenities: body.amenities || existingUnit.amenities,
          notes: body.notes || existingUnit.notes,
          status: body.status || existingUnit.status,
          is_active: body.isActive !== undefined ? body.isActive : existingUnit.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', unitId)
        .select()
        .single();
      
      if (error) {
        console.error('Unit update error:', error);
        return res.status(500).json({ error: 'Failed to update unit' });
      }
      
      return res.json(unit);
      
    } catch (error) {
      console.error('Unit update error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete a unit
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const supabase = getSupabaseClient(process.env);
      const user = req.user as any;
      const unitId = req.params.id;
      
      // Get the unit to verify ownership
      const { data: unit, error: fetchError } = await supabase
        .from('units')
        .select(`
          *,
          property:properties!units_property_id_fkey (
            id,
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (fetchError || !unit) {
        return res.status(404).json({ error: 'Unit not found' });
      }
      
      // Verify user owns the property
      if (unit.property.owner_id !== user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Check if unit has active tenant
      if (unit.tenant_id) {
        return res.status(400).json({ error: 'Cannot delete unit with active tenant' });
      }
      
      // Delete the unit
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);
      
      if (error) {
        console.error('Unit deletion error:', error);
        return res.status(500).json({ error: 'Failed to delete unit' });
      }
      
      return res.json({ message: 'Unit deleted successfully' });
      
    } catch (error) {
      console.error('Unit deletion error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Assign tenant to unit
   */
  async assignTenant(req: AuthRequest, res: Response) {
    try {
      const supabase = getSupabaseClient(process.env);
      const user = req.user as any;
      const unitId = req.params.id;
      const body = req.body;
      
      const { tenantId } = body;
      
      // Get the unit to verify ownership
      const { data: unit, error: fetchError } = await supabase
        .from('units')
        .select(`
          *,
          property:properties!units_property_id_fkey (
            id,
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (fetchError || !unit) {
        return res.status(404).json({ error: 'Unit not found' });
      }
      
      // Verify user owns the property
      if (unit.property.owner_id !== user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Update the unit with tenant assignment
      const { data: updatedUnit, error } = await supabase
        .from('units')
        .update({
          tenant_id: tenantId,
          status: tenantId ? 'OCCUPIED' : 'VACANT',
          updated_at: new Date().toISOString()
        })
        .eq('id', unitId)
        .select()
        .single();
      
      if (error) {
        console.error('Tenant assignment error:', error);
        return res.status(500).json({ error: 'Failed to assign tenant' });
      }
      
      return res.json(updatedUnit);
      
    } catch (error) {
      console.error('Tenant assignment error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Remove tenant from unit
   */
  async removeTenant(req: AuthRequest, res: Response) {
    try {
      const supabase = getSupabaseClient(process.env);
      const user = req.user as any;
      const unitId = req.params.id;
      
      // Get the unit to verify ownership
      const { data: unit, error: fetchError } = await supabase
        .from('units')
        .select(`
          *,
          property:properties!units_property_id_fkey (
            id,
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();
      
      if (fetchError || !unit) {
        return res.status(404).json({ error: 'Unit not found' });
      }
      
      // Verify user owns the property
      if (unit.property.owner_id !== user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Update the unit to remove tenant
      const { data: updatedUnit, error } = await supabase
        .from('units')
        .update({
          tenant_id: null,
          status: 'VACANT',
          updated_at: new Date().toISOString()
        })
        .eq('id', unitId)
        .select()
        .single();
      
      if (error) {
        console.error('Tenant removal error:', error);
        return res.status(500).json({ error: 'Failed to remove tenant' });
      }
      
      return res.json(updatedUnit);
      
    } catch (error) {
      console.error('Tenant removal error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Bulk operations on units
   */
  async bulkOperations(req: AuthRequest, res: Response) {
    try {
      const supabase = getSupabaseClient(process.env);
      const user = req.user as any;
      const body = req.body;
      
      const { unitIds, action, data } = body;
      
      if (!unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
        return res.status(400).json({ error: 'No units selected' });
      }
      
      // Verify user owns all properties for these units
      const { data: units, error: fetchError } = await supabase
        .from('units')
        .select(`
          id,
          property:properties!units_property_id_fkey (
            id,
            owner_id
          )
        `)
        .in('id', unitIds);
      
      if (fetchError) {
        return res.status(500).json({ error: 'Failed to fetch units' });
      }
      
      // Check if user owns all properties
      const unauthorizedUnits = units.filter((unit: any) => unit.property?.owner_id !== user.userId);
      if (unauthorizedUnits.length > 0) {
        return res.status(403).json({ error: 'Access denied to some units' });
      }
      
      let updateData: any = {};
      
      switch (action) {
        case 'archive':
          updateData = { is_active: false };
          break;
        case 'activate':
          updateData = { is_active: true };
          break;
        case 'maintenance':
          updateData = { status: 'MAINTENANCE' };
          break;
        case 'update_rent':
          if (!data.monthlyRent) {
            return res.status(400).json({ error: 'Monthly rent is required' });
          }
          updateData = { monthly_rent: parseFloat(data.monthlyRent) };
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
      
      updateData.updated_at = new Date().toISOString();
      
      // Perform bulk update
      const { error } = await supabase
        .from('units')
        .update(updateData)
        .in('id', unitIds);
      
      if (error) {
        console.error('Bulk operation error:', error);
        return res.status(500).json({ error: 'Failed to perform bulk operation' });
      }
      
      return res.json({ message: `Bulk ${action} completed successfully` });
      
    } catch (error) {
      console.error('Bulk operation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Generate upload URL for unit images
   */
  async generateImageUploadUrl(c: any) {
    try {
      const unitId = c.req.param('id');
      const user = c.get('user');
      const body = await c.req.json();
      const { fileName, fileType } = body;

      if (!fileName || !fileType) {
        return c.json({ error: 'fileName and fileType are required' }, 400);
      }

      // Verify unit exists and user has access
      const supabase = getSupabaseClient(c.env);
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          property:properties!units_property_id_fkey (
            id,
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();

      if (unitError || !unit) {
        return c.json({ error: 'Unit not found' }, 404);
      }

      // Type assertion for the property relationship
      const unitWithProperty = unit as any;
      if (!unitWithProperty.property || unitWithProperty.property.owner_id !== user.userId) {
        return c.json({ error: 'Access denied' }, 403);
      }

      // Generate presigned URL
      const result = await storageService.generatePresignedUrl(fileName, fileType, `units/${unitId}/images`);

      return c.json({
        success: true,
        data: {
          uploadUrl: result.uploadUrl,
          fileName: result.key,
          publicUrl: result.publicUrl
        }
      });
    } catch (error) {
      console.error('Unit image upload URL generation error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Upload unit images directly
   */
  async uploadImages(c: any) {
    try {
      const unitId = c.req.param('id');
      const user = c.get('user');

      // Verify unit exists and user has access
      const supabase = getSupabaseClient(c.env);
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select(`
          id,
          images,
          property:properties!units_property_id_fkey (
            id,
            owner_id
          )
        `)
        .eq('id', unitId)
        .single();

      if (unitError || !unit) {
        return c.json({ error: 'Unit not found' }, 404);
      }

      // Type assertion for the property relationship  
      const unitWithPropertyImg = unit as any;
      if (!unitWithPropertyImg.property || unitWithPropertyImg.property.owner_id !== user.userId) {
        return c.json({ error: 'Access denied' }, 403);
      }

      const formData = await c.req.formData();
      const files = formData.getAll('images') as File[];

      if (!files || files.length === 0) {
        return c.json({ error: 'No images provided' }, 400);
      }

      const uploadedImages = [];

      for (const file of files) {
        if (file && file.size > 0) {
          // Generate unique file name
          const timestamp = Date.now();
          const extension = file.name.split('.').pop();
          const fileName = `units/${unitId}/images/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

          // Upload to R2
          const buffer = await file.arrayBuffer();
          const uploadResult = await storageService.uploadFile(Buffer.from(buffer), fileName, file.type, `units/${unitId}/images`);

          uploadedImages.push(uploadResult.url);
        }
      }

      // Update unit with new images
      const existingImages = unit.images || [];
      const allImages = [...existingImages, ...uploadedImages];

      const { error: updateError } = await supabase
        .from('units')
        .update({ 
          images: allImages,
          updated_at: new Date().toISOString()
        })
        .eq('id', unitId);

      if (updateError) {
        console.error('Unit image update error:', updateError);
        return c.json({ error: 'Failed to update unit images' }, 500);
      }

      return c.json({
        success: true,
        data: {
          images: allImages,
          uploadedCount: uploadedImages.length
        }
      });
    } catch (error) {
      console.error('Unit image upload error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}

export const unitController = new UnitController(); 