/**
 * Browser-compatible script for admin authentication
 * NOTE: Updated to use proper authentication instead of hardcoded tokens
 */

console.log('⚠️  IMPORTANT: Hardcoded JWT tokens have been removed to prevent signature verification errors.');
console.log('🔐 To use admin features, please authenticate through the login flow.');

// Function to check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem('tokenauth');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Current Auth Status:');
  console.log('Token exists:', !!token);
  console.log('User exists:', !!user);
  
  if (token && user) {
    try {
      const userData = JSON.parse(user);
      console.log('Current user:', userData.username);
      console.log('User email:', userData.email);
      console.log('✅ User is authenticated');
      return true;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      return false;
    }
  }
  
  console.log('❌ No authentication found');
  return false;
}

// Function to redirect to login (if not authenticated)
function redirectToLogin() {
  console.log('🔐 Please authenticate by going to the login page');
  console.log('💡 Use admin credentials to access admin features');
}

// Function to clear authentication
function clearAuth() {
  localStorage.removeItem('tokenauth');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('🧹 Authentication cleared');
}

// Check current authentication status
checkAuthStatus();

// Export functions for manual use
window.checkAuthStatus = checkAuthStatus;
window.redirectToLogin = redirectToLogin;
window.clearAuth = clearAuth;
