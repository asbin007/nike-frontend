/**
 * Authentication Test Script
 * This script helps test the authentication flow after removing hardcoded JWT tokens
 */

console.log('🧪 Authentication Test Script');
console.log('============================');

// Function to test authentication endpoints
async function testAuthEndpoints() {
  const baseURL = 'https://nike-backend-1-g9i6.onrender.com/api';
  
  console.log('🔍 Testing backend connectivity...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${baseURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (healthResponse.ok) {
      console.log('✅ Backend is accessible');
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status);
    }
  } catch (error) {
    console.error('❌ Backend connection error:', error.message);
  }
}

// Function to test login flow
async function testLoginFlow() {
  console.log('🔐 Testing login flow...');
  
  // Test data (you may need to adjust these credentials)
  const testCredentials = {
    email: 'admin@gmail.com',
    password: 'admin123' // You may need to adjust this
  };
  
  try {
    const response = await fetch('https://nike-backend-1-g9i6.onrender.com/api/auth/logins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful');
      console.log('Token received:', data.token ? 'Yes' : 'No');
      
      if (data.token) {
        // Store token for testing
        localStorage.setItem('tokenauth', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.user?.id,
          username: data.user?.username,
          email: data.user?.email,
          token: data.token,
          password: null
        }));
        console.log('✅ Token stored in localStorage');
      }
    } else {
      console.log('❌ Login failed:', response.status);
      const errorData = await response.json();
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
  }
}

// Function to test authenticated requests
async function testAuthenticatedRequest() {
  console.log('🔒 Testing authenticated request...');
  
  const token = localStorage.getItem('tokenauth');
  
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  
  try {
    const response = await fetch('https://nike-backend-1-g9i6.onrender.com/api/auth/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Authenticated request successful');
      const data = await response.json();
      console.log('Users count:', data.data?.length || 0);
    } else {
      console.log('❌ Authenticated request failed:', response.status);
      if (response.status === 401) {
        console.log('🔐 Token may be invalid or expired');
      }
    }
  } catch (error) {
    console.error('❌ Authenticated request error:', error.message);
  }
}

// Function to clear authentication
function clearAuth() {
  localStorage.removeItem('tokenauth');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('🧹 Authentication cleared');
}

// Function to check current auth status
function checkAuthStatus() {
  const token = localStorage.getItem('tokenauth');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Current Authentication Status:');
  console.log('Token exists:', !!token);
  console.log('User exists:', !!user);
  
  if (token && user) {
    try {
      const userData = JSON.parse(user);
      console.log('User:', userData.username);
      console.log('Email:', userData.email);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
}

// Main test function
async function runAuthTests() {
  console.log('🚀 Starting authentication tests...\n');
  
  // Check current status
  checkAuthStatus();
  console.log('');
  
  // Test backend connectivity
  await testAuthEndpoints();
  console.log('');
  
  // Test login flow
  await testLoginFlow();
  console.log('');
  
  // Test authenticated request
  await testAuthenticatedRequest();
  console.log('');
  
  console.log('✅ Authentication tests completed!');
  console.log('💡 If tests fail, check your backend JWT_SECRET_KEY configuration');
}

// Export functions for manual use
window.testAuthEndpoints = testAuthEndpoints;
window.testLoginFlow = testLoginFlow;
window.testAuthenticatedRequest = testAuthenticatedRequest;
window.clearAuth = clearAuth;
window.checkAuthStatus = checkAuthStatus;
window.runAuthTests = runAuthTests;

// Auto-run tests
console.log('💡 Run runAuthTests() to start testing, or use individual functions');
console.log('Available functions: testAuthEndpoints, testLoginFlow, testAuthenticatedRequest, clearAuth, checkAuthStatus');
