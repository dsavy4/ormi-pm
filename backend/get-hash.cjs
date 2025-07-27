const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getHash() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@ormi.com' },
      select: { password: true }
    });
    
    console.log('Password hash:', user.password);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getHash(); 