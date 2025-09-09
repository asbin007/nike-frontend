// Utility functions for admin role checking

export const isAdmin = (): boolean => {
  try {
    // Check if user is admin from localStorage
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser.role === 'admin' && parsedUser.isVerified === true;
    }
    
    // Check if user is admin from tokenauth
    const token = localStorage.getItem('tokenauth');
    if (token) {
      // You can decode JWT token here to check role, but for now we'll use a simple check
      // In a real app, you'd decode the JWT and check the role claim
      return false; // Default to false for security
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const shouldShowCostPrice = (): boolean => {
  return isAdmin();
};
