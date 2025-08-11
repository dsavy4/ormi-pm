const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHealthCalculation() {
  try {
    console.log('Testing PropertyHealthService...');
    
    // Test with an existing property
    const propertyId = 'test123';
    
    // Get the property first
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        units: {
          include: {
            payments: true,
            maintenanceRequests: true,
          },
        },
        maintenanceRequests: true,
      },
    });
    
    if (!property) {
      console.log('Property not found');
      return;
    }
    
    console.log('Property found:', property.name);
    console.log('Total units:', property.totalUnits);
    console.log('Occupied units:', property.occupiedUnits);
    console.log('Amenities:', property.amenities);
    console.log('Year built:', property.yearBuilt);
    
    // Calculate basic factors manually
    const totalUnits = property.units.length;
    const occupiedUnits = property.units.filter(unit => unit.status === 'OCCUPIED').length;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    console.log('Calculated occupancy rate:', occupancyRate + '%');
    
    // Test the health calculation logic
    const currentYear = new Date().getFullYear();
    const propertyAge = property.yearBuilt ? currentYear - property.yearBuilt : 0;
    const amenitiesCount = property.amenities ? property.amenities.length : 0;
    
    console.log('Property age:', propertyAge, 'years');
    console.log('Amenities count:', amenitiesCount);
    
    // Simple health score calculation
    let healthScore = 0;
    
    // Occupancy score (40% weight)
    const occupancyScore = Math.min(100, occupancyRate * 1.2);
    healthScore += occupancyScore * 0.4;
    
    // Age score (20% weight) - newer is better
    const ageScore = propertyAge === 0 ? 70 : Math.max(30, 100 - (propertyAge * 2));
    healthScore += ageScore * 0.2;
    
    // Amenities score (20% weight)
    const amenitiesScore = Math.min(100, amenitiesCount * 20);
    healthScore += amenitiesScore * 0.2;
    
    // Base score (20% weight)
    const baseScore = 70;
    healthScore += baseScore * 0.2;
    
    console.log('Calculated health score:', Math.round(healthScore));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHealthCalculation();
