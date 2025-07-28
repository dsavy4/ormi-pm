const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProperties() {
  try {
    console.log('=== CHECKING DATABASE ===');
    
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true
      }
    });
    
    console.log('Available properties:');
    properties.forEach(p => {
      console.log(`- ID: ${p.id}`);
      console.log(`  Name: ${p.name}`);
      console.log(`  Owner: ${p.ownerId}`);
      console.log(`  Created: ${p.createdAt}`);
      console.log('');
    });
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    console.log('Available users:');
    users.forEach(u => {
      console.log(`- ID: ${u.id}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Role: ${u.role}`);
      console.log('');
    });
    
    const units = await prisma.unit.findMany({
      select: {
        id: true,
        unitNumber: true,
        propertyId: true,
        monthlyRent: true
      }
    });
    
    console.log('Available units:');
    units.forEach(u => {
      console.log(`- ID: ${u.id}`);
      console.log(`  Unit: ${u.unitNumber}`);
      console.log(`  Property: ${u.propertyId}`);
      console.log(`  Rent: ${u.monthlyRent}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProperties(); 