// Test script for nike-backend endpoints
import https from 'https';

const baseURL = 'https://nike-backend-1-g9i6.onrender.com/api';

// Test endpoints
const endpoints = [
  { name: 'Health Check', url: '/health', method: 'GET' },
  { name: 'Products', url: '/product', method: 'GET' },
  { name: 'Categories', url: '/category', method: 'GET' },
  { name: 'Users (Auth Required)', url: '/auth/users', method: 'GET', requiresAuth: true },
  { name: 'Chats (Auth Required)', url: '/chats/admin/chats', method: 'GET', requiresAuth: true },
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'nike-backend-1-g9i6.onrender.com',
      port: 443,
      path: `/api${endpoint.url}`,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (endpoint.requiresAuth) {
      options.headers['Authorization'] = 'test-token';
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          name: endpoint.name,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          data: data.substring(0, 200) + (data.length > 200 ? '...' : ''),
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Nike Backend Endpoints...\n');
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    
    const status = result.success ? '✅' : '❌';
    const statusText = result.success ? 'SUCCESS' : 'FAILED';
    
    console.log(`${status} ${result.name}: ${statusText}`);
    console.log(`   Status: ${result.status}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (result.data) {
      console.log(`   Response: ${result.data}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 Test completed!');
}

runTests().catch(console.error);
