import { PrismaClient } from '@prisma/client';

// This script requires the production DATABASE_URL
// You can get it from your Supabase dashboard: https://supabase.com/dashboard/project/kmhmgutrhkzjnsgifsrl/settings/database

const prisma = new PrismaClient();

async function setupProdUser() {
  try {
    console.log('🔧 Setting up demo user in production database...');
    console.log('📝 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL environment variable not set');
      console.log('📝 Please set it with: export DATABASE_URL="your-production-database-url"');
      console.log('🔗 Get the URL from: https://supabase.com/dashboard/project/kmhmgutrhkzjnsgifsrl/settings/database');
      return;
    }
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if users table exists and has data
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Check for demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@ormi.com' }
    });
    
    if (demoUser) {
      console.log('✅ Demo user found, updating password...');
      console.log(`- ID: ${demoUser.id}`);
      console.log(`- Email: ${demoUser.email}`);
      console.log(`- Current password: ${demoUser.password}`);
      
      // Update password
      await prisma.user.update({
        where: { email: 'demo@ormi.com' },
        data: { password: 'ormi123' }
      });
      
      console.log('✅ Password updated to: ormi123');
    } else {
      console.log('🔧 Creating new demo user...');
      
      const newUser = await prisma.user.create({
        data: {
          email: 'demo@ormi.com',
          firstName: 'Demo',
          lastName: 'User',
          password: 'ormi123',
          role: 'ADMIN',
          phoneNumber: '+1-555-0100',
          isActive: true,
          emailVerified: true
        }
      });
      
      console.log('✅ Demo user created successfully');
      console.log(`- ID: ${newUser.id}`);
      console.log(`- Email: ${newUser.email}`);
    }
    
    // Verify the user
    const verifiedUser = await prisma.user.findUnique({
      where: { email: 'demo@ormi.com' }
    });
    
    console.log('\n🎯 Final verification:');
    console.log(`- Email: ${verifiedUser.email}`);
    console.log(`- Password: ${verifiedUser.password}`);
    console.log(`- Role: ${verifiedUser.role}`);
    console.log(`- Active: ${verifiedUser.isActive}`);
    
    const testPassword = 'ormi123';
    const isValid = testPassword === verifiedUser.password;
    console.log(`- Password match test: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    
    if (isValid) {
      console.log('\n🎉 SUCCESS! Demo user is ready for login');
      console.log('🔑 Login credentials: demo@ormi.com / ormi123');
    } else {
      console.log('\n❌ Password verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure DATABASE_URL is correct');
    console.log('2. Check if the database is accessible');
    console.log('3. Verify the Prisma schema matches the database');
  } finally {
    await prisma.$disconnect();
  }
}

setupProdUser(); 