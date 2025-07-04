const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://kmhmgutrhkzjnsgifsrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttaG1ndXRyaGt6am5zZ2lmc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDYwNTYsImV4cCI6MjA2NzA4MjA1Nn0.Yeg2TBq3K9jddh-LQFHadr1rv_GaYS-SBVTfnZS6z3c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create the user directly in Supabase using camelCase field names
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: 'demo@ormi.com',
          password: hashedPassword,
          firstName: 'Demo',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user:', error);
      return;
    }

    console.log('✅ Demo user created successfully:', data);
    
    // Create a sample property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert([
        {
          name: 'Sunset Apartments',
          address: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          description: 'Modern apartment complex with luxury amenities',
          ownerId: data.id
        }
      ])
      .select()
      .single();

    if (propertyError) {
      console.error('❌ Error creating property:', propertyError);
      return;
    }

    console.log('✅ Sample property created:', property);
    
    console.log('\n🎉 Demo data created successfully!');
    console.log('\n📧 Demo Login Credentials:');
    console.log('Email: demo@ormi.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createDemoUser(); 