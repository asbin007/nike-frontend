/**
 * Script to set up admin token for chatbot functionality
 * NOTE: This script has been updated to use proper authentication
 * Instead of hardcoded tokens, users should authenticate through the login flow
 */

console.log('⚠️  IMPORTANT: Hardcoded JWT tokens have been removed to prevent signature verification errors.');
console.log('🔐 To use admin features, please:');
console.log('1. Go to the login page');
console.log('2. Use admin credentials to authenticate');
console.log('3. The system will automatically set up the admin token');

// Function to check if user is already authenticated
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

// Check current authentication status
checkAuthStatus();
