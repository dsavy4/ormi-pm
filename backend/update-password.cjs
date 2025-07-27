const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@ormi.com';
  const newPassword = 'ormi123'; // Plain text password

  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { password: newPassword }
    });
    console.log('Password updated for user:', user.email);
    console.log('New password (plain text):', newPassword);
  } catch (e) {
    console.error('Error updating password:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 