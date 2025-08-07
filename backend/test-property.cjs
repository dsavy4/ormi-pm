const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kmhmgutrhkzjnsgifsrl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttaG1ndXRyaGt6am5zZ2lmc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDYwNTYsImV4cCI6MjA2NzA4MjA1Nn0.Yeg2TBq3K9jddh-LQFHadr1rv_GaYS-SBVTfnZS6z3c'
);

async function testProperty() {
  const propertyId = 'cmdmawgtd0003iy3kdjxeikvx';
  
  console.log(`Testing property ID: ${propertyId}`);
  
  try {
    // Test 1: Check if property exists
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return;
    }
    
    if (property) {
      console.log('✅ Property found:', {
        id: property.id,
        name: property.name,
        address: property.address,
        ownerId: property.ownerId
      });
    } else {
      console.log('❌ Property not found');
    }
    
    // Test 2: List all properties to see what's available
    const { data: allProperties, error: listError } = await supabase
      .from('properties')
      .select('id, name, address')
      .limit(5);
    
    if (listError) {
      console.error('List error:', listError);
      return;
    }
    
    console.log('\n📋 Available properties:');
    allProperties.forEach(p => {
      console.log(`- ${p.id}: ${p.name} (${p.address})`);
    });
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

testProperty(); 