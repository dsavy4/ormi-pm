const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProperty() {
  try {
    const property = await prisma.property.findFirst({
      where: { name: 'Downtown Lofts' },
      include: {
        units: {
          select: {
            id: true,
            unitNumber: true,
            status: true,
            tenantId: true
          }
        }
      }
    });
    
    if (property) {
      console.log('Property:', property.name);
      console.log('Database totalUnits:', property.totalUnits);
      console.log('Database occupiedUnits:', property.occupiedUnits);
      console.log('Actual units count:', property.units.length);
      console.log('Actual occupied count:', property.units.filter(u => u.status === 'OCCUPIED').length);
      console.log('Actual vacant count:', property.units.filter(u => u.status === 'VACANT').length);
      
      // Show first few units
      console.log('\nFirst 5 units:');
      property.units.slice(0, 5).forEach(unit => {
        console.log(`  ${unit.unitNumber}: ${unit.status} (tenantId: ${unit.tenantId ? 'YES' : 'NO'})`);
      });
    } else {
      console.log('Property not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProperty(); 