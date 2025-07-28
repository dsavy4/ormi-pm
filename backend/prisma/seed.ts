import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create users with plain text passwords (no bcrypt)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ormi.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'admin123', // This should be changed in production
      role: 'ADMIN',
      phoneNumber: '+1-555-0100',
      isActive: true,
      emailVerified: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@ormi.com',
      firstName: 'Property',
      lastName: 'Manager',
      password: 'manager123', // This should be changed in production
      role: 'MANAGER',
      phoneNumber: '+1-555-0101',
      isActive: true,
      emailVerified: true,
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      email: 'tenant1@ormi.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'tenant123', // This should be changed in production
      role: 'TENANT',
      phoneNumber: '+1-555-0200',
      isActive: true,
      emailVerified: true,
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      email: 'tenant2@ormi.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: 'tenant123', // This should be changed in production
      role: 'TENANT',
      phoneNumber: '+1-555-0201',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Sunset Apartments',
      address: '123 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      propertyType: 'APARTMENT',
      totalUnits: 24,
      occupiedUnits: 20,
      monthlyRent: 2500.00,
      propertyManagerId: manager.id,
      ownerId: admin.id, // Add ownerId
      images: [
        'https://r2.ormi.com/properties/sunset-apts-1.jpg',
        'https://r2.ormi.com/properties/sunset-apts-2.jpg'
      ],
      description: 'Modern apartment complex with great amenities',
      amenities: ['Pool', 'Gym', 'Parking', 'Laundry'],
      isActive: true,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Downtown Lofts',
      address: '456 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90211',
      propertyType: 'APARTMENT',
      totalUnits: 12,
      occupiedUnits: 10,
      monthlyRent: 3200.00,
      propertyManagerId: manager.id,
      ownerId: admin.id, // Add ownerId
      images: [
        'https://r2.ormi.com/properties/downtown-lofts-1.jpg'
      ],
      description: 'Luxury lofts in the heart of downtown',
      amenities: ['Rooftop Deck', 'Concierge', 'Parking', 'Security'],
      isActive: true,
    },
  });

  // Create units
  const unit1 = await prisma.unit.create({
    data: {
      unitNumber: '101',
      propertyId: property1.id,
      tenantId: tenant1.id,
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 1200,
      monthlyRent: 2500.00,
      status: 'OCCUPIED',
      images: [
        'https://r2.ormi.com/units/unit-101-1.jpg',
        'https://r2.ormi.com/units/unit-101-2.jpg'
      ],
      amenities: ['Balcony', 'Walk-in Closet', 'Dishwasher'],
      isActive: true,
    },
  });

  const unit2 = await prisma.unit.create({
    data: {
      unitNumber: '102',
      propertyId: property1.id,
      tenantId: tenant2.id,
      bedrooms: 1,
      bathrooms: 1,
      squareFootage: 800,
      monthlyRent: 2000.00,
      status: 'OCCUPIED',
      images: [
        'https://r2.ormi.com/units/unit-102-1.jpg'
      ],
      amenities: ['Balcony', 'Dishwasher'],
      isActive: true,
    },
  });

  const unit3 = await prisma.unit.create({
    data: {
      unitNumber: '201',
      propertyId: property2.id,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1500,
      monthlyRent: 3200.00,
      status: 'VACANT',
      images: [
        'https://r2.ormi.com/units/unit-201-1.jpg'
      ],
      amenities: ['Balcony', 'Walk-in Closet', 'Dishwasher', 'Fireplace'],
      isActive: true,
    },
  });

  // Create payments
  const payment1 = await prisma.payment.create({
    data: {
      amount: 2500.00,
      currency: 'USD',
      status: 'PAID',
      method: 'STRIPE_CARD',
      stripePaymentIntentId: 'pi_test_123',
      stripePaymentId: 'ch_test_123',
      unitId: unit1.id,
      tenantId: tenant1.id,
      description: 'January 2024 Rent',
      dueDate: new Date('2024-01-01'),
      paymentDate: new Date('2024-01-01'),
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      amount: 2000.00,
      currency: 'USD',
      status: 'PAID',
      method: 'STRIPE_ACH',
      stripePaymentIntentId: 'pi_test_124',
      stripePaymentId: 'ch_test_124',
      unitId: unit2.id,
      tenantId: tenant2.id,
      description: 'January 2024 Rent',
      dueDate: new Date('2024-01-01'),
      paymentDate: new Date('2024-01-01'),
    },
  });

  const payment3 = await prisma.payment.create({
    data: {
      amount: 2500.00,
      currency: 'USD',
      status: 'PENDING',
      method: 'STRIPE_CARD',
      unitId: unit1.id,
      tenantId: tenant1.id,
      description: 'February 2024 Rent',
      dueDate: new Date('2024-02-01'),
    },
  });

  // Create maintenance requests
  const maintenance1 = await prisma.maintenanceRequest.create({
    data: {
      title: 'Leaky Faucet',
      description: 'Kitchen faucet is leaking and needs repair',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      unitId: unit1.id,
      tenantId: tenant1.id,
      assignedTo: manager.id,
      estimatedCost: 150.00,
      images: [
        'https://r2.ormi.com/maintenance/leaky-faucet-1.jpg'
      ],
    },
  });

  const maintenance2 = await prisma.maintenanceRequest.create({
    data: {
      title: 'AC Not Working',
      description: 'Air conditioning unit is not cooling properly',
      priority: 'URGENT',
      status: 'SUBMITTED',
      unitId: unit2.id,
      tenantId: tenant2.id,
      estimatedCost: 300.00,
    },
  });

  // Create documents
  const document1 = await prisma.document.create({
    data: {
      fileName: 'Lease_Agreement_Unit_101.pdf',
      fileUrl: 'https://r2.ormi.com/documents/lease-unit-101.pdf',
      fileType: 'LEASE',
      fileSize: 1024000,
      tenantId: tenant1.id,
    },
  });

  const document2 = await prisma.document.create({
    data: {
      fileName: 'Rent_Receipt_January_2024.pdf',
      fileUrl: 'https://r2.ormi.com/documents/receipt-jan-2024.pdf',
      fileType: 'RECEIPT',
      fileSize: 512000,
      tenantId: tenant1.id,
    },
  });

  // Create checklists
  const checklist1 = await prisma.checklist.create({
    data: {
      type: 'MOVE_IN',
      title: 'Move-in Checklist',
      description: 'Complete checklist for new tenant move-in',
      tenantId: tenant1.id,
      items: [
        { id: 1, text: 'Check all appliances', completed: true },
        { id: 2, text: 'Test heating and cooling', completed: true },
        { id: 3, text: 'Verify smoke detectors', completed: true },
        { id: 4, text: 'Document existing damage', completed: false }
      ],
      isCompleted: false,
    },
  });

  // Create tenant surveys
  const survey1 = await prisma.tenantSurvey.create({
    data: {
      tenantId: tenant1.id,
      propertyId: property1.id,
      rating: 5,
      feedback: 'Great property management experience!',
      category: 'GENERAL',
    },
  });

  // Create payment schedules
  const schedule1 = await prisma.paymentSchedule.create({
    data: {
      tenantId: tenant1.id,
      unitId: unit1.id,
      amount: 2500.00,
      frequency: 'MONTHLY',
      startDate: new Date('2024-01-01'),
      description: 'Monthly rent payment',
      isActive: true,
    },
  });

  // Create community announcements
  const announcement1 = await prisma.communityAnnouncement.create({
    data: {
      title: 'Pool Maintenance Notice',
      content: 'The pool will be closed for maintenance on Friday from 9 AM to 2 PM.',
      authorId: manager.id,
      isActive: true,
    },
  });

  const announcement2 = await prisma.communityAnnouncement.create({
    data: {
      title: 'Welcome New Tenants!',
      content: 'Welcome to all new tenants. Please review the community guidelines.',
      authorId: manager.id,
      isActive: true,
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.property.count()} properties`);
  console.log(`Created ${await prisma.unit.count()} units`);
  console.log(`Created ${await prisma.payment.count()} payments`);
  console.log(`Created ${await prisma.maintenanceRequest.count()} maintenance requests`);
  console.log(`Created ${await prisma.document.count()} documents`);
  console.log(`Created ${await prisma.checklist.count()} checklists`);
  console.log(`Created ${await prisma.tenantSurvey.count()} surveys`);
  console.log(`Created ${await prisma.paymentSchedule.count()} payment schedules`);
  console.log(`Created ${await prisma.communityAnnouncement.count()} announcements`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 