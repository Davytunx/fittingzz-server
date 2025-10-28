// Simple API test script
const BASE_URL = 'http://localhost:5001';

async function testAPI() {
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test API root
    const apiResponse = await fetch(`${BASE_URL}/api/v1`);
    const apiData = await apiResponse.json();
    console.log('✅ API root:', apiData.message);

    console.log('\n🎉 API is working correctly!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();