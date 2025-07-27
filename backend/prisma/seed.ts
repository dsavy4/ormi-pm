import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users with plain text passwords (no bcrypt)
  const admin = await prisma.user.create({
    data: {
      email: 'demo@ormi.com',
      firstName: 'Demo',
      lastName: 'User',
      password: 'ormi123',
      role: 'ADMIN',
      phoneNumber: '+1-555-0100',
      isActive: true,
      emailVerified: true,
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@ormi.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      password: 'password123',
      role: 'MANAGER',
      phoneNumber: '+1-555-0101',
      isActive: true,
      emailVerified: true,
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      email: 'john.smith@email.com',
      firstName: 'John',
      lastName: 'Smith',
      password: 'password123',
      role: 'TENANT',
      phoneNumber: '+1-555-0201',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('👥 Created users');

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Sunset Apartments',
      address: '123 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      description: 'Luxury apartment complex with ocean views',
      notes: 'High-end property with premium amenities',
      ownerId: admin.id,
      managerId: manager1.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Downtown Lofts',
      address: '456 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      description: 'Modern loft-style apartments in the heart of downtown',
      notes: 'Perfect for young professionals',
      ownerId: admin.id,
      managerId: manager1.id,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      name: 'Riverside Gardens',
      address: '789 River Road',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      description: 'Peaceful garden apartments with river views',
      notes: 'Family-friendly community with playground',
      ownerId: admin.id,
      managerId: manager1.id,
    },
  });

  console.log('🏢 Created properties');

  // Create units
  const unit1 = await prisma.unit.create({
    data: {
      unitNumber: '101',
      monthlyRent: 2500.00,
      securityDeposit: 2500.00,
      leaseStatus: 'LEASED',
      leaseStart: new Date('2024-01-01'),
      leaseEnd: new Date('2024-12-31'),
      notes: 'Ocean view unit',
      propertyId: property1.id,
      tenantId: tenant1.id,
    },
  });

  const unit2 = await prisma.unit.create({
    data: {
      unitNumber: '102',
      monthlyRent: 2800.00,
      securityDeposit: 2800.00,
      leaseStatus: 'VACANT',
      notes: 'Corner unit with balcony',
      propertyId: property1.id,
    },
  });

  const unit3 = await prisma.unit.create({
    data: {
      unitNumber: '201',
      monthlyRent: 3200.00,
      securityDeposit: 3200.00,
      leaseStatus: 'LEASED',
      leaseStart: new Date('2024-02-01'),
      leaseEnd: new Date('2025-01-31'),
      notes: 'Penthouse suite',
      propertyId: property2.id,
    },
  });

  console.log('🏠 Created units');

  // Create payments
  const payment1 = await prisma.payment.create({
    data: {
      amount: 2500.00,
      dueDate: new Date('2024-01-01'),
      paymentDate: new Date('2024-01-01'),
      status: 'PAID',
      method: 'MANUAL',
      notes: 'Rent payment for January',
      unitId: unit1.id,
      tenantId: tenant1.id,
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      amount: 2500.00,
      dueDate: new Date('2024-02-01'),
      paymentDate: new Date('2024-02-01'),
      status: 'PAID',
      method: 'MANUAL',
      notes: 'Rent payment for February',
      unitId: unit1.id,
      tenantId: tenant1.id,
    },
  });

  console.log('💰 Created payments');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 