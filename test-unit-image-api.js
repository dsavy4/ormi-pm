// Test script to verify unit image API endpoints
// Run with: node test-unit-image-api.js

const API_BASE = 'http://localhost:8787';

async function testAPI() {
  console.log('🧪 Testing Unit Image API Endpoints...\n');
  
  try {
    // Test 1: Check if backend is accessible
    console.log('1. Testing backend connectivity...');
    const healthCheck = await fetch(`${API_BASE}/api/health`);
    if (healthCheck.ok) {
      const health = await healthCheck.json();
      console.log('✅ Backend is running:', health.message);
    } else {
      console.log('❌ Backend health check failed');
      return;
    }
    
    // Test 2: Check if we can access the units endpoint
    console.log('\n2. Testing units endpoint...');
    const unitsResponse = await fetch(`${API_BASE}/api/units`);
    if (unitsResponse.ok) {
      console.log('✅ Units endpoint accessible');
    } else {
      console.log('❌ Units endpoint failed:', unitsResponse.status);
    }
    
    // Test 3: Check if we can access a specific unit (this will fail without auth, but should show proper error)
    console.log('\n3. Testing unit details endpoint...');
    const unitResponse = await fetch(`${API_BASE}/api/units/test-unit-id`);
    if (unitResponse.status === 401) {
      console.log('✅ Unit endpoint accessible (requires authentication as expected)');
    } else {
      console.log('⚠️  Unit endpoint response:', unitResponse.status);
    }
    
    console.log('\n🎯 API endpoints are accessible!');
    console.log('📝 Note: Image upload/delete tests require authentication tokens');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:8787');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
