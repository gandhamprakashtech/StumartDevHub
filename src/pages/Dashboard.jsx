import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { signOut, getCurrentUser } from '../services/authService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // Show loading state
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

  // Don't render if user data is not available (will redirect)
  if (!user || !student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Student Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {student.name}!
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/account-settings"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Account Settings
              </Link>
              <Link
                to="/create-post"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                + Create Post
              </Link>
            </div>
          </div>
        </div>

        {/* Student Information Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Student Information
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">PIN Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{student.pin_number}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{student.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{student.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(student.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Welcome Message */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-indigo-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">
                Welcome to StumartDevHub!
              </h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>
                  Your account has been successfully verified. You can now access all features of the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  <script type="module" src="/auth.js"></script>
}

