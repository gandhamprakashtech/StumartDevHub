import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { signOut, getCurrentUser } from '../services/authService';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(true);

  /**
   * Load current user and student data
   */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user: currentUser, student: studentData, error } = await getCurrentUser();
        
        if (error || !currentUser || !studentData) {
          // If user is not authenticated or verified, redirect to login
          navigate('/login');
          return;
        }

        setUser(currentUser);
        setStudent(studentData);
        
        // Check if welcome alert has been dismissed
        const welcomeDismissed = localStorage.getItem('welcomeAlertDismissed');
        setShowWelcomeAlert(!welcomeDismissed);
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
  const confirmLogout = window.confirm("Are you sure you want to logout?");

  if (!confirmLogout) {
    return;
  }

  setIsLoggingOut(true);

  try {
    await signOut();
    navigate('/login');
  } catch (error) {
    console.error('Logout error:', error);
    navigate('/login');
  } finally {
    setIsLoggingOut(false);
  }
};

  /**
   * Handle dismissing welcome alert
   */
  const handleDismissWelcome = () => {
    setShowWelcomeAlert(false);
    localStorage.setItem('welcomeAlertDismissed', 'true');
  };

  // Show loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-lg rounded-lg mb-6 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 bg-white/20 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-64 animate-pulse"></div>
              </div>
              <div className="h-10 bg-white/20 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Student Information Card Skeleton */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center p-3 rounded-md bg-gray-50">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-3"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Section Skeleton */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-6 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-32 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user data is not available (will redirect)
  if (!user || !student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-lg rounded-lg mb-6 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Student Profile 
              </h1>
              <p className="text-sm opacity-90">
                Welcome back, {student.name}!
              </p>
            </div>
          </div>
        </div>

        {/* Student Information Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Student Information
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center p-3 rounded-md bg-gray-50">
              <svg className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div>
                <dt className="text-sm font-normal text-gray-600">PIN Number</dt>
                <dd className="text-sm font-medium text-gray-900 font-mono">{student.pin_number}</dd>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-md bg-gray-50">
              <svg className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <dt className="text-sm font-normal text-gray-600">Name</dt>
                <dd className="text-sm font-medium text-gray-900">{student.name}</dd>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-md bg-gray-50">
              <svg className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <dt className="text-sm font-normal text-gray-600">Email</dt>
                <dd className="text-sm font-medium text-gray-900 flex items-center">{student.email} <span className="ml-2 text-green-600">✓</span></dd>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-md bg-gray-50">
              <svg className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <dt className="text-sm font-normal text-gray-600">Status</dt>
                <dd className="mt-1">
                  <span 
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      student.status === 'pending' 
                        ? 'bg-yellow-50 text-yellow-700' 
                        : 'bg-green-50 text-green-700'
                    }`}
                    title={student.status === 'pending' ? 'Account verification pending' : 'Account is enabled and active'}
                  >
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </dd>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-md bg-gray-50">
              <svg className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <dt className="text-sm font-normal text-gray-600">Account Created</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(student.created_at).toLocaleDateString()}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Your Posts and Liked Posts Buttons */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/MyPosts"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Your Posts
            </Link>
            <Link
              to="/liked-posts"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Liked Posts
            </Link>
          </div>
        </div>

        {/* Welcome Alert - Dismissible */}
        {showWelcomeAlert && (
          <div className="bg-indigo-50 shadow-sm rounded-lg p-6 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-indigo-800">
                  Account Active
                </h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>
                    Your account is active and verified. You can now access all features of the platform.
                  </p>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    className="inline-flex bg-indigo-50 rounded-md p-1.5 text-indigo-500 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-50 focus:ring-indigo-600"
                    onClick={handleDismissWelcome}
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Section - Conditional rendering based on posts existence */}
        {false ? ( // Replace with actual posts check when posts are implemented
          <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Recent Activity
            </h2>
            {/* Future: Render actual posts here */}
          </div>
        ) : (
          /* Empty state - no card wrapper for cleaner look */
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No activity yet</h3>
            <p className="mt-2 text-sm text-gray-500">Start by creating your first post to see activity here.</p>
            <div className="mt-6">
              <Link
                to="/create-post"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Post
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Create Post - Only show when welcome alert is dismissed */}
      {!showWelcomeAlert && (
        <Link
          to="/create-post"
          className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors"
          title="Create Post"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </div>
  );
}

