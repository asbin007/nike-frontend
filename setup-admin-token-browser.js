/**
 * Browser-compatible script to set up admin token for chatbot functionality
 * Run this in browser console
 */

// Admin data from the provided response
const adminData = {
  "message": "Admin logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzN2NiMzNlYS1jMTY0LTQ2NzgtYjRiZS1iYzQ1YjNjYzBlMTciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjEzMDIzMTMsImV4cCI6MTc2Mzg5NDMxM30.WTma_AyaxNtcHIiYfEMxEgd6raW3KX4x9gNRHhVJUys",
  "user": {
    "id": "37cb33ea-c164-4678-b4be-bc45b3cc0e17",
    "username": "admin",
    "email": "admin@gmail.com",
    "role": "admin"
  }
};

// Function to set up admin token
function setupAdminToken() {
  try {
    // Set up admin token in localStorage
    localStorage.setItem('adminToken', adminData.token);
    localStorage.setItem('adminUser', JSON.stringify(adminData.user));
    
    console.log('✅ Admin token setup completed!');
    console.log('Token:', adminData.token.substring(0, 20) + '...');
    console.log('User:', adminData.user.username);
    console.log('Role:', adminData.user.role);
    
    // Verify setup
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    console.log('🔍 Verification:');
    console.log('Token stored:', !!storedToken);
    console.log('User stored:', !!storedUser.username);
    console.log('Ready for chatbot!');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up admin token:', error);
    return false;
  }
}

// Function to check if admin token is set up
function checkAdminToken() {
  const token = localStorage.getItem('adminToken');
  const user = localStorage.getItem('adminUser');
  
  console.log('🔍 Admin Token Status:');
  console.log('Token exists:', !!token);
  console.log('User exists:', !!user);
  
  if (token && user) {
    const userData = JSON.parse(user);
    console.log('Admin user:', userData.username);
    console.log('Admin role:', userData.role);
  }
  
  return !!(token && user);
}

// Function to clear admin token
function clearAdminToken() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('🧹 Admin token cleared');
}

// Auto-run setup if not already set up
if (!checkAdminToken()) {
  console.log('🚀 Setting up admin token...');
  setupAdminToken();
} else {
  console.log('✅ Admin token already set up');
}

// Export functions for manual use
window.setupAdminToken = setupAdminToken;
window.checkAdminToken = checkAdminToken;
window.clearAdminToken = clearAdminToken;
