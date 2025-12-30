import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { getCurrentUser } from '../services/authService';

/**
 * ProtectedRoute Component
 * 
 * This component protects routes that require authentication.
 * It checks:
 * 1. User is logged in
 * 2. Email is verified
 * 3. Student record exists
 * 
 * If any check fails, redirects to login page.
 */
export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, student, error } = await getCurrentUser();
        
        // User must be authenticated, verified, and have a student record
        if (user && student && !error) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return children;
}

