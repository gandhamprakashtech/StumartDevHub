import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser, signOut } from '../services/authService';
import { supabase } from '../services/supabaseClient';

export default function AccountSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user: currentUser, student: studentData, error } = await getCurrentUser();

        if (error || !currentUser || !studentData) {
          navigate('/login');
          return;
        }

        setUser(currentUser);
        setStudent(studentData);
        setFormData({
          name: studentData.name || '',
          email: currentUser.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    setSuccessMessage('');
    setErrors({});

    try {
      let needsReauth = false;

      // Update name in students table if changed
      if (formData.name !== student.name) {
        const { error: updateError } = await supabase
          .from('students')
          .update({ name: formData.name })
          .eq('pin_number', student.pin_number);

        if (updateError) {
          throw new Error('Failed to update name: ' + updateError.message);
        }
      }

      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });

        if (emailError) {
          throw new Error('Failed to update email: ' + emailError.message);
        }
        needsReauth = true;
      }

      // Update password if provided
      if (formData.newPassword) {
        // First, reauthenticate with current password
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: formData.currentPassword
        });

        if (reauthError) {
          throw new Error('Current password is incorrect');
        }

        // Now update to new password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) {
          throw new Error('Failed to update password: ' + passwordError.message);
        }
        needsReauth = true;
      }

      setSuccessMessage('Account updated successfully!');

      if (needsReauth) {
        setSuccessMessage('Account updated successfully! Please check your email for verification if you changed your email.');
      }

      // Refresh user data
      const { user: updatedUser, student: updatedStudent } = await getCurrentUser();
      setUser(updatedUser);
      setStudent(updatedStudent);

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Update error:', error);
      setErrors({ general: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (!confirmLogout) {
      return;
    }

    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

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

  if (!user || !student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account information
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password (required to change password)
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}