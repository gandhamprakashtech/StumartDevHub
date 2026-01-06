import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { signUp } from '../services/authService';

/* Amazon-style animated input (UI ONLY) */
const inputStyle =
  "w-full mb-2 px-4 py-3 rounded-full border border-gray-300 outline-none " +
  "transition-all duration-300 " +
  "focus:border-indigo-500 " +
  "focus:ring-4 focus:ring-indigo-400/40 " +
  "hover:border-indigo-400";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pinNumber: '',
    firstname: '',
    secondname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form data (UNCHANGED)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pinNumber.trim()) {
      newErrors.pinNumber = 'PIN number is required';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Student name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change (UNCHANGED)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Submit (UNCHANGED)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signUp({
        pinNumber: formData.pinNumber.trim(),
        name: formData.name?.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (result.success) {
        setSuccessMessage('Please verify your email to activate your account');

        setFormData({
          pinNumber: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
      <div className="w-[900px] max-w-[95%] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT */}
        <div className="md:w-1/2 p-10 text-white bg-gradient-to-br from-indigo-500 to-pink-400 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">Create your account</h1>
          <p className="text-sm opacity-90">
            Please register here
          </p>
        </div>

        {/* RIGHT */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-6">
            Student Registration
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              name="pinNumber"
              placeholder="PIN Number"
              value={formData.pinNumber}
              onChange={handleChange}
              className={inputStyle}
            />
            {errors.pinNumber && (
              <p className="text-red-600 text-sm mb-2">{errors.pinNumber}</p>
            )}

            <input
              name="name"
              placeholder="Student Name"
              value={formData.name || ''}
              onChange={handleChange}
              className={inputStyle}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mb-2">{errors.name}</p>
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={inputStyle}
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputStyle + " mb-4"}
            />

            {successMessage && (
              <p className="text-green-600 text-sm mb-3">{successMessage}</p>
            )}

            {errors.submit && (
              <p className="text-red-600 text-sm mb-3">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 to-pink-400 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
