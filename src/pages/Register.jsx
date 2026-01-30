import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { signUp } from '../services/authService';
import { 
  getAvailableJoiningYears,
  getAvailableBranches,
  getAvailableYears,
  getAvailableSections,
  getAvailablePINs 
} from '../services/pinService';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    joiningYear: '',
    branch: '',
    year: '',
    section: '',
    pinNumber: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [availableJoiningYears, setAvailableJoiningYears] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availablePINs, setAvailablePINs] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [loadingJoiningYears, setLoadingJoiningYears] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingPINs, setLoadingPINs] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shake, setShake] = useState(false);

  // Fetch available joining years on mount
  useEffect(() => {
    const fetchJoiningYears = async () => {
      setLoadingJoiningYears(true);
      const result = await getAvailableJoiningYears();
      if (result.success) {
        setAvailableJoiningYears(result.data || []);
      }
      setLoadingJoiningYears(false);
    };
    fetchJoiningYears();
  }, []);

  // Fetch available branches when joining year changes
  useEffect(() => {
    const fetchBranches = async () => {
      if (formData.joiningYear) {
        setLoadingBranches(true);
        const result = await getAvailableBranches(parseInt(formData.joiningYear));
        if (result.success) {
          setAvailableBranches(result.data || []);
        }
        setLoadingBranches(false);
        // Reset dependent fields
        setFormData((prev) => ({ ...prev, branch: '', year: '', section: '', pinNumber: '' }));
      } else {
        setAvailableBranches([]);
        setFormData((prev) => ({ ...prev, branch: '', year: '', section: '', pinNumber: '' }));
      }
    };
    fetchBranches();
  }, [formData.joiningYear]);

  // Fetch available academic years when joining year and branch change
  useEffect(() => {
    const fetchYears = async () => {
      if (formData.joiningYear && formData.branch) {
        setLoadingYears(true);
        const result = await getAvailableYears(parseInt(formData.joiningYear), formData.branch);
        if (result.success) {
          setAvailableYears(result.data || []);
        }
        setLoadingYears(false);
        // Reset dependent fields
        setFormData((prev) => ({ ...prev, year: '', section: '', pinNumber: '' }));
      } else {
        setAvailableYears([]);
        setFormData((prev) => ({ ...prev, year: '', section: '', pinNumber: '' }));
      }
    };
    fetchYears();
  }, [formData.joiningYear, formData.branch]);

  // Fetch available sections when joining year, branch and year changes
  useEffect(() => {
    const fetchSections = async () => {
      if (formData.joiningYear && formData.branch && formData.year) {
        setLoadingSections(true);
        const result = await getAvailableSections(
          parseInt(formData.joiningYear),
          formData.branch,
          parseInt(formData.year)
        );
        
        if (result.success) {
          setAvailableSections(result.data || []);
        } else {
          setAvailableSections([]);
        }
        setLoadingSections(false);
        
        // Reset section and PIN when joining year/branch/year changes
        setFormData((prev) => ({ ...prev, section: '', pinNumber: '' }));
      } else {
        setAvailableSections([]);
        setFormData((prev) => ({ ...prev, section: '', pinNumber: '' }));
      }
    };

    fetchSections();
  }, [formData.joiningYear, formData.branch, formData.year]);

  // Fetch available PINs when joining year, branch, year, or section changes
  useEffect(() => {
    const fetchPINs = async () => {
      if (formData.joiningYear && formData.branch && formData.year && formData.section) {
        setLoadingPINs(true);
        const result = await getAvailablePINs(
          parseInt(formData.joiningYear),
          formData.branch,
          parseInt(formData.year),
          formData.section.toUpperCase()
        );
        
        if (result.success) {
          setAvailablePINs(result.data || []);
        } else {
          setAvailablePINs([]);
          setErrors((prev) => ({ ...prev, pinNumber: result.error }));
        }
        setLoadingPINs(false);
      } else {
        setAvailablePINs([]);
        setFormData((prev) => ({ ...prev, pinNumber: '' }));
      }
    };

    fetchPINs();
  }, [formData.joiningYear, formData.branch, formData.year, formData.section]);

  // Auto-fill branch, year, section when PIN is selected
  useEffect(() => {
    if (formData.pinNumber && availablePINs.length > 0) {
      const selectedPIN = availablePINs.find(
        (pin) => pin.pin_number === formData.pinNumber
      );
      if (selectedPIN) {
        // PIN already contains branch, year, section info
        // No need to auto-fill as they're already selected
      }
    }
  }, [formData.pinNumber, availablePINs]);

  /* ---------- Validation ---------- */
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.joiningYear) {
      newErrors.joiningYear = 'Joining year is required';
    }
    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }
    if (!formData.year) {
      newErrors.year = 'Year is required';
    }
    if (!formData.section) {
      newErrors.section = 'Section is required';
    }
    if (!formData.pinNumber) {
      newErrors.pinNumber = 'PIN number is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset dependent fields when joining year, branch, year, or section changes
    if (name === 'joiningYear') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        branch: '',
        year: '',
        section: '',
        pinNumber: '', // Reset all dependent fields
      }));
    } else if (name === 'branch') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        year: '',
        section: '',
        pinNumber: '', // Reset dependent fields
      }));
    } else if (name === 'year') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        section: '',
        pinNumber: '', // Reset dependent fields
      }));
    } else if (name === 'section') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        pinNumber: '', // Reset PIN selection
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    setErrors((prev) => ({ ...prev, [name]: '' }));
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
        setSuccessMessage('Registration successful! Please check your email and click the confirmation link to activate your account. You will be redirected to login page.');
        setTimeout(() => navigate('/login'), 5000);
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

  /* ---------- Icons ---------- */
  const eyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const eyeOffIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19.5c-5.99 0-9.5-7.5-9.5-7.5a21.12 21.12 0 0 1 4.36-5.2" />
      <path d="M1 1l22 22" />
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
    </svg>
  );

  /* ---------- UI ---------- */
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-student-illustration.png.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/70" aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/20 backdrop-blur-xl
        border border-white/30 shadow-2xl space-y-6
        ${shake ? 'animate-shake' : ''}`}
      >
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Create Student Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Joining Year */}
          <div className="relative">
            <select
              name="joiningYear"
              value={formData.joiningYear}
              onChange={handleChange}
              disabled={loadingJoiningYears}
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.joiningYear ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.joiningYear ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}
              ${loadingJoiningYears ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingJoiningYears
                  ? 'Loading years...'
                  : availableJoiningYears.length === 0
                  ? 'No joining years available'
                  : 'Select Joining Year'}
              </option>
              {availableJoiningYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              ${errors.joiningYear ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10'}`}>
              Joining Year <span className="text-red-500">*</span>
            </label>
            {errors.joiningYear && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.joiningYear}
              </div>
            )}
          </div>

          {/* Branch */}
          <div className="relative">
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              disabled={!formData.joiningYear || loadingBranches}
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.branch ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.branch ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}
              ${!formData.joiningYear || loadingBranches ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingBranches
                  ? 'Loading branches...'
                  : !formData.joiningYear
                  ? 'Select Joining Year first'
                  : availableBranches.length === 0
                  ? 'No branches available'
                  : 'Select Branch'}
              </option>
              {availableBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              ${errors.branch ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10'}`}>
              Branch <span className="text-red-500">*</span>
            </label>
            {errors.branch && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.branch}
              </div>
            )}
          </div>

          {/* Year */}
          <div className="relative">
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              disabled={!formData.joiningYear || !formData.branch || loadingYears}
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.year ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.year ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}
              ${!formData.joiningYear || !formData.branch || loadingYears ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingYears
                  ? 'Loading years...'
                  : !formData.joiningYear || !formData.branch
                  ? 'Select Joining Year and Branch first'
                  : availableYears.length === 0
                  ? 'No years available'
                  : 'Select Year'}
              </option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}st Year
                </option>
              ))}
            </select>
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              ${errors.year ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10'}`}>
              Year <span className="text-red-500">*</span>
            </label>
            {errors.year && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.year}
              </div>
            )}
          </div>

          {/* Section */}
          <div className="relative">
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              disabled={!formData.joiningYear || !formData.branch || !formData.year || loadingSections}
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.section ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.section ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}
              ${!formData.joiningYear || !formData.branch || !formData.year || loadingSections ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingSections
                  ? 'Loading sections...'
                  : !formData.joiningYear || !formData.branch || !formData.year
                  ? 'Select Joining Year, Branch and Year first'
                  : availableSections.length === 0
                  ? 'No sections available'
                  : 'Select Section'}
              </option>
              {availableSections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              ${errors.section ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10'}`}>
              Section <span className="text-red-500">*</span>
            </label>
            {errors.section && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.section}
              </div>
            )}
            {!errors.section && formData.branch && formData.year && !loadingSections && (
              <div className="absolute left-4 top-full mt-1 text-xs text-gray-500">
                {availableSections.length > 0
                  ? `${availableSections.length} section(s) available`
                  : 'No sections available for this branch/year'}
              </div>
            )}
          </div>

          {/* PIN Number */}
          <div className="relative">
            <select
              name="pinNumber"
              value={formData.pinNumber}
              onChange={handleChange}
              disabled={!formData.joiningYear || !formData.branch || !formData.year || !formData.section || loadingPINs}
              className={`peer w-full px-4 pt-6 pb-3 rounded-xl placeholder-black backdrop-blur-md outline-none
              ${errors.pinNumber ? 'border border-red-500 bg-red-100' : 'border border-white/40 bg-indigo-50 peer-placeholder-shown:bg-white/40'}
              focus:ring-2 ${errors.pinNumber ? 'focus:ring-red-400' : 'focus:ring-indigo-400'}
              ${!formData.branch || !formData.year || !formData.section || loadingPINs ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingPINs
                  ? 'Loading PINs...'
                  : !formData.branch || !formData.year || !formData.section
                  ? 'Select Branch, Year, and Section first'
                  : availablePINs.length === 0
                  ? 'No available PINs'
                  : 'Select PIN Number'}
              </option>
              {availablePINs.map((pin) => (
                <option key={pin.pin_number} value={pin.pin_number}>
                  {pin.pin_number}
                </option>
              ))}
            </select>
            <label className={`absolute left-4 top-1 text-sm transition-all backdrop-blur-sm px-1 rounded-sm
              ${errors.pinNumber ? 'text-red-600 bg-red-50' : 'text-indigo-500 bg-white/10'}`}>
              PIN Number <span className="text-red-500">*</span>
            </label>
            {errors.pinNumber && (
              <div className="absolute left-4 top-full mt-3 z-50 bg-red-200 border border-red-400 text-red-900 text-sm px-3 py-1 rounded shadow-md animate-popup">
                {errors.pinNumber}
              </div>
            )}
            {!errors.pinNumber && formData.branch && formData.year && formData.section && !loadingPINs && (
              <div className="absolute left-4 top-full mt-1 text-xs text-gray-500">
                {availablePINs.length > 0
                  ? `${availablePINs.length} PIN(s) available`
                  : 'No PINs available for this combination'}
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