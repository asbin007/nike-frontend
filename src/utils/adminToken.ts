/**
 * Utility functions for managing admin token for chatbot functionality
 */

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AdminLoginResponse {
  message: string;
  token: string;
  user: AdminUser;
}

/**
 * Set up admin token for chatbot authentication
 * @param adminData - Admin login response data
 */
export const setupAdminToken = (adminData: AdminLoginResponse): void => {
  try {
    // Store admin token in localStorage
    localStorage.setItem('adminToken', adminData.token);
    
    // Store admin user data
    localStorage.setItem('adminUser', JSON.stringify(adminData.user));
    
    console.log('✅ Admin token setup completed:', {
      token: adminData.token.substring(0, 20) + '...',
      user: adminData.user.username,
      role: adminData.user.role
    });
  } catch (error) {
    console.error('❌ Error setting up admin token:', error);
    throw error;
  }
};

/**
 * Get admin token from localStorage
 * @returns Admin token or null if not found
 */
export const getAdminToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

/**
 * Get admin user data from localStorage
 * @returns Admin user data or null if not found
 */
export const getAdminUser = (): AdminUser | null => {
  try {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  } catch (error) {
    console.error('❌ Error parsing admin user data:', error);
    return null;
  }
};

/**
 * Clear admin token and user data
 */
export const clearAdminToken = (): void => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('🧹 Admin token cleared');
};

/**
 * Check if admin token exists and is valid
 * @returns True if admin token exists
 */
export const hasAdminToken = (): boolean => {
  return !!getAdminToken();
};

/**
 * Get formatted admin token for API calls
 * @returns Formatted token with Bearer prefix or empty string
 */
export const getFormattedAdminToken = (): string => {
  const token = getAdminToken();
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};
