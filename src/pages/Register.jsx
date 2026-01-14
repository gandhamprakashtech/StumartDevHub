import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { signUp } from '../services/authService';


export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pinNumber: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shake, setShake] = useState(false);

  /* ---------- Validation ---------- */
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /**
   * Validate PIN Number
   * Format: XX030-BRANCH-XXX
   * - First 5 digits must end with 030 (college identifier)
   * - Branch code: 1+ uppercase letters
   * - Last 3 digits: exactly 3 digits
   */
  const validatePinNumber = (pinNumber) => {
    const trimmed = pinNumber.trim();

    if (!trimmed) {
      return 'PIN number is required';
    }

    // Check format: XX030-BRANCH-XXX
    const pinPattern = /^[0-9]{2}030-[A-Z]+-[0-9]{3}$/;
    
    if (!pinPattern.test(trimmed)) {
      // Provide more specific error messages
      const parts = trimmed.split('-');
      
      if (parts.length !== 3) {
        return 'Invalid format. Expected: XX030-BRANCH-XXX (e.g., 23030-CM-048)';
      }
      
      const [firstPart, branchPart, lastPart] = parts;
      
      // Check first part
      if (!/^[0-9]{5}$/.test(firstPart)) {
        return 'First part must be exactly 5 digits';
      }
      
      if (!firstPart.endsWith('030')) {
        return 'First 5 digits must end with 030 (college identifier)';
      }
      
      // Check branch part
      if (!/^[A-Z]+$/.test(branchPart)) {
        if (/^[a-z]+$/.test(branchPart)) {
          return 'Branch code must be uppercase (e.g., CM, M, EC)';
        }
        return 'Branch code must contain only uppercase letters';
      }
      
      // Check last part
      if (!/^[0-9]{3}$/.test(lastPart)) {
        return 'Last part must be exactly 3 digits';
      }
      
      return 'Invalid PIN format. Expected: XX030-BRANCH-XXX (e.g., 23030-CM-001)';
    }

    return null; // Valid
  };

  const validateForm = () => {
    const newErrors = {};

    const pinError = validatePinNumber(formData.pinNumber);
    if (pinError) {
      newErrors.pinNumber = pinError;
    }

    if (!formData.name.trim())
      newErrors.name = 'Student name is required';

    if (!formData.email.trim())
      newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.password)
      newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Minimum 6 characters';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format PIN number: convert branch code to uppercase
    let processedValue = value;
    if (name === 'pinNumber') {
      // Split by dashes and uppercase the branch code part
      const parts = value.split('-');
      if (parts.length >= 2) {
        // Uppercase the branch code (middle part)
        parts[1] = parts[1].toUpperCase();
        processedValue = parts.join('-');
      } else if (parts.length === 1 && value.includes('-')) {
        // Handle case where user is typing in branch section
        const beforeDash = value.substring(0, value.lastIndexOf('-') + 1);
        const afterDash = value.substring(value.lastIndexOf('-') + 1);
        processedValue = beforeDash + afterDash.toUpperCase();
      }
    }
    
    setFormData((p) => ({ ...p, [name]: processedValue }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp({
        pinNumber: formData.pinNumber.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (result.success) {
        setSuccessMessage('Please verify your email to activate your account');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErrors({ submit: result.error });
        setShake(true);
      }
    } catch (err) {
      setErrors({ submit: err.message });
      setShake(true);
    } finally {
      setTimeout(() => setShake(false), 400);
      setIsLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md p-8 rounded-2xl bg-white/20 backdrop-blur-xl
        border border-white/30 shadow-2xl space-y-6
        ${shake ? 'animate-shake' : ''}`}
      >
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Create Student Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* PIN */}
          <div className="relative">
            <input
              name="pinNumber"
              value={formData.pinNumber}
              onChange={handleChange}
              placeholder=" "
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.pinNumber ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.pinNumber ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}`}
            />
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              peer-placeholder-shown:top-6 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-sm
              ${errors.pinNumber ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10 peer-placeholder-shown:text-gray-600 peer-focus:text-indigo-500'}`}>
              PIN Number
            </label>
            {!errors.pinNumber && formData.pinNumber && (
              <div className="absolute left-4 top-full mt-1 text-xs text-gray-500">
                Format: XX030-BRANCH-XXX (e.g., 23030-CM-001)
              </div>
            )}
            {errors.pinNumber && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.pinNumber}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="relative">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder=" "
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.name ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.name ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}`}
            />
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              peer-placeholder-shown:top-6 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-sm
              ${errors.name ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10 peer-placeholder-shown:text-gray-600 peer-focus:text-indigo-500'}`}>
              Student Name
            </label>
            {errors.name && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.name}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.email ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.email ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}`}
            />
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              peer-placeholder-shown:top-6 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-sm
              ${errors.email ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10 peer-placeholder-shown:text-gray-600 peer-focus:text-indigo-500'}`}>
              Email Address
            </label>
            {errors.email && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.password ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.password ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}`}
            />
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              peer-placeholder-shown:top-6 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-sm
              ${errors.password ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10 peer-placeholder-shown:text-gray-600 peer-focus:text-indigo-500'}`}>
              Password
            </label>
            {errors.password && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.password}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer absolute right-4 top-5.5 text-gray-600 hover:text-indigo-600"
            >
              {showPassword ? eyeOffIcon : eyeIcon}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder=" "
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.confirmPassword ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.confirmPassword ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}`}
            />
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              peer-placeholder-shown:top-6 peer-placeholder-shown:text-base
              peer-focus:top-1 peer-focus:text-sm
              ${errors.confirmPassword ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10 peer-placeholder-shown:text-gray-600 peer-focus:text-indigo-500'}`}>
              Confirm Password
            </label>
            {errors.confirmPassword && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.confirmPassword}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="cursor-pointer absolute right-4 top-5.5 text-gray-600 hover:text-indigo-600"
            >
              {showConfirmPassword ? eyeOffIcon : eyeIcon}
            </button>
          </div>

          <button
            disabled={isLoading}
            className="cursor-pointer w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold
            hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {errors.submit && (
            <p className="text-center text-sm text-red-600 animate-pulse">
              {errors.submit}
            </p>
          )}

          {successMessage && (
            <p className="text-center text-sm text-green-600 animate-pulse">
              {successMessage}
            </p>
          )}
        </form>

        <p className="text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Login
          </Link>
        </p>
      </div>

      <style>
        {`
          .animate-shake {
            animation: shake 0.35s;
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            50% { transform: translateX(6px); }
            75% { transform: translateX(-6px); }
            100% { transform: translateX(0); }
          }
          .animate-popup {
            animation: fadeInUp 180ms cubic-bezier(.2,.9,.2,1) both;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(-6px) scale(.995); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
    </div>
  );
}

/* ---------- Icons ---------- */
const eyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
<script type="module" src="/auth.js"></script>


const eyeOffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19.5c-5.99 0-9.5-7.5-9.5-7.5a21.12 21.12 0 0 1 4.36-5.2" />
    <path d="M1 1l22 22" />
    <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
  </svg>
);
