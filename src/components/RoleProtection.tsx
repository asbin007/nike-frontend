import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { toast } from 'react-hot-toast';

interface RoleProtectionProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackPath?: string;
}

const RoleProtection: React.FC<RoleProtectionProps> = ({ 
  allowedRoles, 
  children, 
  fallbackPath = '/' 
}) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((store) => store.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get user data from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        let userRole = 'customer'; // Default role

        if (user?.token) {
          // If user is logged in, get role from Redux store
          userRole = 'customer'; // Default for customer frontend
        } else if (storedUser) {
          // Parse stored user data
          const parsedUser = JSON.parse(storedUser);
          userRole = parsedUser.role || 'customer';
        }

        // Check if user role is allowed
        if (!allowedRoles.includes(userRole)) {
          toast.error(`Access denied. This page is only for ${allowedRoles.join(' or ')} users.`, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#dc2626',
              color: '#ffffff',
              padding: '12px 16px',
              borderRadius: '8px',
            },
          });
          
          // Redirect to appropriate page
          if (userRole === 'admin') {
            // If admin tries to access customer pages, redirect to admin panel
            window.location.href = 'https://admin-panel-eight-henna.vercel.app';
          } else {
            // If customer tries to access admin pages, redirect to home
            navigate(fallbackPath);
          }
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Role check error:', error);
        toast.error('Authentication error. Please login again.', {
          duration: 4000,
          position: 'top-center',
        });
        navigate('/login');
      }
    };

    checkAccess();
  }, [user, allowedRoles, navigate, fallbackPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtection;
