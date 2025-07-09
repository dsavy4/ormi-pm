const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePassword() {
  try {
    console.log('Updating demo user password to ormi124...');
    
    // Update the password for demo@ormi.com
    const { data, error } = await supabase
      .from('users')
      .update({ password: 'ormi124' })
      .eq('email', 'demo@ormi.com');

    if (error) {
      console.error('Error updating password:', error);
      process.exit(1);
    }

    console.log('✓ Password updated successfully!');
    console.log('Demo user (demo@ormi.com) can now login with password: ormi124');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

updatePassword(); 