import React, { useState, useEffect } from 'react';
import { signIn, resendVerificationEmail } from '../services/authService';
import { useNavigate, Link } from "react-router-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";





export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  /**
   * Validate email format
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form data on frontend
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    // Clear resend message when user changes email
    if (name === 'email') {
      setResendMessage('');
      setShowResendEmail(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setResendMessage('');
    setShowResendEmail(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call signin service
      const result = await signIn(
        formData.email.trim().toLowerCase(),
        formData.password
      );

      if (result.success) {
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        // Check if error is related to email verification
        if (result.error && result.error.toLowerCase().includes('verify')) {
          setShowResendEmail(true);
        }
        // Show error message
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle resend verification email
   */
  const handleResendVerification = async () => {
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setResendMessage('Please enter a valid email address');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    try {
      const result = await resendVerificationEmail(formData.email.trim().toLowerCase());
      
      if (result.success) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendMessage(result.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setResendMessage(error.message || 'An unexpected error occurred');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your  account          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new student account
            </Link>
          </p>
        </div>

        <form className=" mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email */}
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

            {/* Password */}
            {/* Password */}
<div className="relative">
  <label htmlFor="password" className="sr-only">
    Password
  </label>

  <div className='flex'>
    <input
      type={showPassword ? 'text' : 'password'}
      id="password"
      name="password"
      autoComplete="current-password"
      required
      value={formData.password}
      onChange={handleChange}
      className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
      placeholder="Password"
    />
    {/* Eye Icon */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="flex cursor-pointer items-center pl-3 pr-3 text-gray-500 border border-gray-300 hover:text-gray-700"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        /* Eye Off Icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.02.152-2.004.437-2.93M6.343 6.343A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10a9.956 9.956 0 01-1.343 5.657M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        </svg>
      ) : (
        /* Eye Icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      )}
    </button>
  </div>

  {errors.password && (
    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
  )}
</div>
<div className="text-sm text-right mt-2">
  <Link
    to="/forgot-password"
    className="font-medium text-indigo-600 hover:text-indigo-500"
  >
    Forgot your password?
  </Link>
</div>



          {/* Resend Verification Email Section */}
          {showResendEmail && (
            <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    Your email is not verified. Please verify your email to continue.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend verification email'}
                  </button>
                  {resendMessage && (
                    <p className={`mt-2 text-sm ${
                      resendMessage.includes('sent') 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      {resendMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errors.submit}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
    
  );
  <script type="module" src="/auth.js"></script>
}
