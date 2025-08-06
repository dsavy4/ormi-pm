import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUnits() {
  try {
    console.log('🌱 Seeding units...');

    // Get the first property to add units to
    const property = await prisma.property.findFirst();
    
    if (!property) {
      console.log('❌ No property found. Please seed properties first.');
      return;
    }

    console.log(`📦 Adding units to property: ${property.name}`);

    // Create 12 units with realistic data
    const units = [
      {
        unitNumber: '101',
        propertyId: property.id,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 850,
        monthlyRent: 1800.00,
        status: 'OCCUPIED',
        amenities: ['AC', 'W/D', 'Dishwasher'],
        isActive: true
      },
      {
        unitNumber: '102',
        propertyId: property.id,
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 650,
        monthlyRent: 1400.00,
        status: 'VACANT',
        amenities: ['AC', 'W/D'],
        isActive: true
      },
      {
        unitNumber: '201',
        propertyId: property.id,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1200,
        monthlyRent: 2200.00,
        status: 'OCCUPIED',
        amenities: ['AC', 'W/D', 'Dishwasher', 'Balcony'],
        isActive: true
      },
      {
        unitNumber: '202',
        propertyId: property.id,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 950,
        monthlyRent: 1900.00,
        status: 'MAINTENANCE',
        amenities: ['AC', 'W/D'],
        isActive: true
      },
      {
        unitNumber: '301',
        propertyId: property.id,
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 750,
        monthlyRent: 1600.00,
        status: 'OCCUPIED',
        amenities: ['AC', 'W/D', 'Dishwasher'],
        isActive: true
      },
      {
        unitNumber: '302',
        propertyId: property.id,
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1100,
        monthlyRent: 2000.00,
        status: 'VACANT',
        amenities: ['AC', 'W/D', 'Dishwasher', 'Balcony'],
        isActive: true
      },
      {
        unitNumber: '401',
        propertyId: property.id,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1300,
        monthlyRent: 2400.00,
        status: 'OCCUPIED',
        amenities: ['AC', 'W/D', 'Dishwasher', 'Balcony', 'Storage'],
        isActive: true
      },
      {
        unitNumber: '402',
        propertyId: property.id,
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 700,
        monthlyRent: 1500.00,
        status: 'VACANT',
        amenities: ['AC', 'W/D'],
        isActive: true
      },
      {
        unitNumber: '501',
        propertyId: property.id,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 900,
        monthlyRent: 1700.00,
        status: 'OCCUPIED',
        amenities: ['AC', 'W/D', 'Dishwasher'],
        isActive: true
      },
      {
        unitNumber: '502',
        propertyId: property.id,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1250,
        monthlyRent: 2300.00,
        status: 'MAINTENANCE',
        amenities: ['AC', 'W/D', 'Dishwasher', 'Balcony'],
        isActive: true
      },
      {
        unitNumber: '601',
        propertyId: property.id,
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 800,
        monthlyRent: 1550.00,
        status: 'VACANT',
        amenities: ['AC', 'W/D'],
        isActive: true
      },
      {
        unitNumber: '602',
        propertyId: property.id,
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1050,
        monthlyRent: 1950.00,
        status: 'OCCUPIED',
        amenities: ['AC', 'W/D', 'Dishwasher'],
        isActive: true
      }
    ];

    // Create units
    for (const unitData of units) {
      const unit = await prisma.unit.create({
        data: unitData
      });
      console.log(`✅ Created unit ${unit.unitNumber}`);
    }

    // Update property with correct unit counts
    const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
    const vacantUnits = units.filter(u => u.status === 'VACANT').length;
    const maintenanceUnits = units.filter(u => u.status === 'MAINTENANCE').length;

    await prisma.property.update({
      where: { id: property.id },
      data: {
        totalUnits: units.length,
        occupiedUnits: occupiedUnits
      }
    });

    console.log(`📊 Property updated:`);
    console.log(`   - Total Units: ${units.length}`);
    console.log(`   - Occupied: ${occupiedUnits}`);
    console.log(`   - Vacant: ${vacantUnits}`);
    console.log(`   - Maintenance: ${maintenanceUnits}`);

    console.log('🎉 Units seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUnits(); 