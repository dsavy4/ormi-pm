import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.create({
    data: {
      email: 'demo@ormi.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true
    }
  });
  
  console.log('✅ Demo user created:', user.email);
  
  // Create sample property
  const property = await prisma.property.create({
    data: {
      name: 'Sunset Apartments',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      description: 'Modern apartment complex with luxury amenities',
      ownerId: user.id
    }
  });
  
  console.log('✅ Sample property created:', property.name);
  
  // Create sample units
  const units = await prisma.unit.createMany({
    data: [
      {
        unitNumber: 'A-101',
        monthlyRent: 3200,
        securityDeposit: 3200,
        leaseStatus: 'VACANT',
        propertyId: property.id
      },
      {
        unitNumber: 'A-102',
        monthlyRent: 2800,
        securityDeposit: 2800,
        leaseStatus: 'VACANT',
        propertyId: property.id
      }
    ]
  });
  
  console.log('✅ Sample units created');
  
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Demo Login Credentials:');
  console.log('Email: demo@ormi.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 