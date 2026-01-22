import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentAdmin, adminSignOut } from '../services/adminService';
import { getPINStatistics } from '../services/pinService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pinStats, setPinStats] = useState({
    totalPINs: 0,
    availablePINs: 0,
    registeredPINs: 0,
    branchesCount: 0,
    sectionsCount: 0,
    branches: [],
    sections: [],
  });
  const [pinStatsLoading, setPinStatsLoading] = useState(true);


  /**
   * Load current admin data and statistics
   */
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const { admin: adminData, error } = await getCurrentAdmin();
        
        if (error || !adminData) {
          // If admin is not authenticated, redirect to admin login
          navigate('/admin/login');
          return;
        }

        setAdmin(adminData);

        // Load PIN statistics
        const pinStatsResult = await getPINStatistics();
        if (pinStatsResult.success && pinStatsResult.data) {
          setPinStats({
            totalPINs: pinStatsResult.data.totalPINs || 0,
            availablePINs: pinStatsResult.data.availablePINs || 0,
            registeredPINs: pinStatsResult.data.registeredPINs || 0,
            branchesCount: pinStatsResult.data.branchesCount || 0,
            sectionsCount: pinStatsResult.data.sectionsCount || 0,
            branches: pinStatsResult.data.branches || [],
            sections: pinStatsResult.data.sections || [],
          });
        }
        setPinStatsLoading(false);
      } catch (error) {
        console.error('Error loading admin data:', error);
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [navigate]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await adminSignOut();
      if (result.success) {
        navigate('/admin/login');
      } else {
        console.error('Logout error:', result.error);
        // Still redirect to login even if logout has an error
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
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

  // Don't render if admin data is not available (will redirect)
  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                StuMart - AANM VVRSR Polytechnic Gudlavalleru
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome, Admin!
          </h2>
          <p className="text-gray-600">
            This is your admin dashboard. Here you can manage student accounts, 
            view registrations, and control the platform.
          </p>
        </div>

        {/* PIN Statistics Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            PIN Management Statistics
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm font-medium text-indigo-600">Total PINs</p>
              <p className="text-3xl font-bold text-indigo-900 mt-2">
                {pinStatsLoading ? '...' : pinStats.totalPINs}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-600">Available</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {pinStatsLoading ? '...' : pinStats.availablePINs}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-600">Registered</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {pinStatsLoading ? '...' : pinStats.registeredPINs}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-600">Branches</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {pinStatsLoading ? '...' : pinStats.branchesCount}
              </p>
              {!pinStatsLoading && pinStats.branches.length > 0 && (
                <p className="text-xs text-purple-600 mt-1">
                  {pinStats.branches.join(', ')}
                </p>
              )}
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-600">Sections</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {pinStatsLoading ? '...' : pinStats.sectionsCount}
              </p>
              {!pinStatsLoading && pinStats.sections.length > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  {pinStats.sections.slice(0, 5).join(', ')}
                  {pinStats.sections.length > 5 && ` +${pinStats.sections.length - 5} more`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button 
              onClick={() => navigate('/admin/pin-management')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900">Manage PIN Numbers</h3>
              <p className="text-sm text-gray-500 mt-1">Create and manage student PIN numbers</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">View Registered Students</h3>
              <p className="text-sm text-gray-500 mt-1">Approve or reject student accounts</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
              <h3 className="font-medium text-gray-900">View Products</h3>
              <p className="text-sm text-gray-500 mt-1">Monitor and moderate product listings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



