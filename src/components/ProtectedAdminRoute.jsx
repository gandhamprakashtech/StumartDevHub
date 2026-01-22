import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { getCurrentAdmin } from '../services/adminService';

/**
 * ProtectedAdminRoute Component
 * 
 * This component protects admin routes that require admin authentication.
 * It checks:
 * 1. User is logged in
 * 2. User is an admin (exists in admin_users table)
 * 
 * If any check fails, redirects to admin login page.
 */
export default function ProtectedAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { admin, error } = await getCurrentAdmin();
        
        // Admin must be authenticated (checked via sessionStorage)
        if (admin && !error) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Admin auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render protected content
  return children;
}



