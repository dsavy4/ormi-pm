const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmhmgutrhkzjnsgifsrl.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // We need the service role key, not anon key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAuthUser() {
  try {
    // Create user through Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'demo@ormi.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        firstName: 'Demo',
        lastName: 'User',
        role: 'ADMIN'
      }
    });

    if (error) {
      console.error('❌ Error creating auth user:', error);
      return;
    }

    console.log('✅ Auth user created successfully:', data);
    
    // Now create the user profile in our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          firstName: 'Demo',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      return;
    }

    console.log('✅ User profile created:', userProfile);
    
    console.log('\n🎉 Complete user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Email: demo@ormi.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// NOTE: This requires the SERVICE_ROLE_KEY, not the anon key
// You can find this in your Supabase dashboard under Settings > API
createAuthUser(); 