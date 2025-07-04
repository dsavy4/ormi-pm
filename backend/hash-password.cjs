const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'ormi123';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  console.log('Password:', password);
  console.log('Hashed Password:', hashedPassword);
  console.log('\n📋 Copy this hashed value to use in your Supabase users table:');
  console.log(hashedPassword);
}

hashPassword(); 