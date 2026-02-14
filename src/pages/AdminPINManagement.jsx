import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentAdmin } from '../services/adminService';
import { 
  createPINsBulk, 
  createPINsIndividual, 
  getAllPINs, 
  deletePIN,
  updatePINStatus,
  getPINStatistics 
} from '../services/pinService';

export default function AdminPINManagement() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manage'

  // Create PIN form state
  const [formData, setFormData] = useState({
    joiningYear: new Date().getFullYear().toString(), // Default to current year
    branch: '',
    year: '',
    section: '',
    entryMethod: 'range',
    startSequence: '',
    endSequence: '',
    individualPINs: '',
  });

  // Manage PINs state
  const [allPINs, setAllPINs] = useState([]);
  const [loadingPINs, setLoadingPINs] = useState(false);
  const [filters, setFilters] = useState({
    joiningYear: '',
    branch: '',
    year: '',
    section: '',
    status: '',
  });
  const [selectedPINs, setSelectedPINs] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalPINs: 0,
    availablePINs: 0,
    registeredPINs: 0,
    branchesCount: 0,
    sectionsCount: 0,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Branch options
  const branchOptions = [
    { value: 'CME', label: 'CME (Computer Science)' },
    { value: 'CE', label: 'CE (Civil)' },
    { value: 'M', label: 'M (Mechanical)' },
    { value: 'ECE', label: 'ECE' },
    { value: 'EEE', label: 'EEE' },
    { value: 'CIOT', label: 'CIOT' },
    { value: 'AIML', label: 'AIML' },
  ];

  // Year options
  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
  ];

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'registered', label: 'Registered' },
    { value: 'blocked', label: 'Blocked' },
  ];

  // Check admin authentication
  useEffect(() => {
    const checkAdmin = async () => {
      const { admin, error } = await getCurrentAdmin();
      if (error || !admin) {
        navigate('/admin/login');
      } else {
        setIsLoading(false);
        loadStatistics();
        if (activeTab === 'manage') {
          loadPINs();
        }
      }
    };
    checkAdmin();
  }, [navigate]);

  // Load PINs when filters change or tab changes
  useEffect(() => {
    if (activeTab === 'manage') {
      loadPINs();
    }
  }, [filters, activeTab]);

  const loadStatistics = async () => {
    const result = await getPINStatistics();
    if (result.success && result.data) {
      setStats(result.data);
    }
  };

  const loadPINs = async () => {
    setLoadingPINs(true);
    const result = await getAllPINs(filters);
    if (result.success) {
      setAllPINs(result.data || []);
    }
    setLoadingPINs(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSuccessMessage('');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setSelectedPINs([]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.joiningYear) {
      newErrors.joiningYear = 'Joining year is required';
    } else if (isNaN(formData.joiningYear) || parseInt(formData.joiningYear) < 2000 || parseInt(formData.joiningYear) > 2100) {
      newErrors.joiningYear = 'Please enter a valid year (2000-2100)';
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

    if (formData.entryMethod === 'range') {
      if (!formData.startSequence) {
        newErrors.startSequence = 'Start number is required';
      } else if (isNaN(formData.startSequence) || parseInt(formData.startSequence) < 1) {
        newErrors.startSequence = 'Start number must be a positive integer';
      }
      if (!formData.endSequence) {
        newErrors.endSequence = 'End number is required';
      } else if (isNaN(formData.endSequence) || parseInt(formData.endSequence) < 1) {
        newErrors.endSequence = 'End number must be a positive integer';
      }
      if (formData.startSequence && formData.endSequence) {
        if (parseInt(formData.startSequence) > parseInt(formData.endSequence)) {
          newErrors.endSequence = 'End number must be greater than start number';
        }
      }
    } else {
      if (!formData.individualPINs.trim()) {
        newErrors.individualPINs = 'Please enter PIN numbers';
      } else {
        const pins = formData.individualPINs.split(',').map((p) => p.trim()).filter(Boolean);
        if (pins.length === 0) {
          newErrors.individualPINs = 'Please enter at least one PIN number';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (formData.entryMethod === 'range') {
        result = await createPINsBulk(
          parseInt(formData.joiningYear),
          formData.branch,
          parseInt(formData.year),
          formData.section.toUpperCase(),
          parseInt(formData.startSequence),
          parseInt(formData.endSequence)
        );
      } else {
        const pinNumbers = formData.individualPINs
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);
        
        result = await createPINsIndividual(
          pinNumbers,
          parseInt(formData.joiningYear),
          formData.branch,
          parseInt(formData.year),
          formData.section.toUpperCase()
        );
      }

      if (result.success) {
        const yearCode = String(formData.joiningYear).slice(-2);
        setSuccessMessage(
          `Successfully created ${result.count} PIN(s) for ${yearCode}030-${formData.branch}-XXX (Joining Year: ${formData.joiningYear}, Branch: ${formData.branch}, Year: ${formData.year}, Section: ${formData.section.toUpperCase()})`
        );
        setFormData({
          joiningYear: new Date().getFullYear().toString(),
          branch: '',
          year: '',
          section: '',
          entryMethod: 'range',
          startSequence: '',
          endSequence: '',
          individualPINs: '',
        });
        loadStatistics();
        if (activeTab === 'manage') {
          loadPINs();
        }
      } else {
        setErrors({ submit: result.error || 'Failed to create PINs' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePIN = async (pinNumber) => {
    if (!window.confirm(
      `⚠️ WARNING: This will permanently delete:\n\n` +
      `• PIN: ${pinNumber}\n` +
      `• Student account (if registered)\n` +
      `• All products created by this student\n` +
      `• All related data\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you sure you want to proceed?`
    )) {
      return;
    }

    const result = await deletePIN(pinNumber);
    if (result.success) {
      const deleted = result.deleted || {};
      let message = `PIN ${pinNumber} deleted successfully`;
      if (deleted.student) {
        message += `\n• Student account deleted`;
      }
      if (deleted.productsCount > 0) {
        message += `\n• ${deleted.productsCount} product(s) deleted`;
      }
      setSuccessMessage(message);
      loadPINs();
      loadStatistics();
      setSelectedPINs(selectedPINs.filter((pin) => pin !== pinNumber));
    } else {
      setErrors({ submit: result.error || 'Failed to delete PIN and account' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPINs.length === 0) {
      alert('Please select at least one PIN to delete');
      return;
    }

    if (!window.confirm(
      `⚠️ WARNING: This will permanently delete:\n\n` +
      `• ${selectedPINs.length} PIN(s)\n` +
      `• All associated student accounts\n` +
      `• All products created by these students\n` +
      `• All related data\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you sure you want to proceed?`
    )) {
      return;
    }

    let deleted = 0;
    let failed = 0;
    let totalStudents = 0;
    let totalProducts = 0;

    for (const pinNumber of selectedPINs) {
      const result = await deletePIN(pinNumber);
      if (result.success) {
        deleted++;
        if (result.deleted?.student) totalStudents++;
        if (result.deleted?.productsCount) totalProducts += result.deleted.productsCount;
      } else {
        failed++;
        console.error(`Failed to delete PIN ${pinNumber}:`, result.error);
      }
    }

    if (deleted > 0) {
      let message = `Successfully deleted ${deleted} PIN(s)`;
      if (totalStudents > 0) message += `\n• ${totalStudents} student account(s) deleted`;
      if (totalProducts > 0) message += `\n• ${totalProducts} product(s) deleted`;
      if (failed > 0) message += `\n• ${failed} failed`;
      setSuccessMessage(message);
      loadPINs();
      loadStatistics();
      setSelectedPINs([]);
    } else {
      setErrors({ submit: `Failed to delete PINs. ${failed} failed.` });
    }
  };

  const handleToggleSelect = (pinNumber) => {
    setSelectedPINs((prev) =>
      prev.includes(pinNumber)
        ? prev.filter((p) => p !== pinNumber)
        : [...prev, pinNumber]
    );
  };

  const handleSelectAll = () => {
    if (selectedPINs.length === allPINs.length) {
      setSelectedPINs([]);
    } else {
      setSelectedPINs(allPINs.map((pin) => pin.pin_number));
    }
  };

  const getPreviewPINs = () => {
    if (!formData.branch || !formData.year || !formData.section) {
      return [];
    }

    const section = formData.section.toUpperCase();

    if (!formData.joiningYear || !formData.branch) {
      return [];
    }

    const yearCode = String(formData.joiningYear).slice(-2); // Last 2 digits

    if (formData.entryMethod === 'range') {
      const start = parseInt(formData.startSequence) || 1;
      const end = parseInt(formData.endSequence) || start;
      const preview = [];
      for (let i = start; i <= Math.min(end, start + 4); i++) {
        const pinSequence = String(i).padStart(3, '0');
        preview.push(`${yearCode}030-${formData.branch}-${pinSequence}`);
      }
      if (end > start + 4) {
        preview.push(`... (${end - start - 4} more)`);
      }
      return preview;
    } else {
      const pins = formData.individualPINs
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 5);
      return pins.map((pin) => {
        const pinSequence = String(pin).padStart(3, '0');
        return `${yearCode}030-${formData.branch}-${pinSequence}`;
      });
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PIN Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage student PIN numbers
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Total PINs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPINs}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.availablePINs}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Registered</p>
            <p className="text-2xl font-bold text-blue-600">{stats.registeredPINs}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Branches</p>
            <p className="text-2xl font-bold text-purple-600">{stats.branchesCount}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">Sections</p>
            <p className="text-2xl font-bold text-orange-600">{stats.sectionsCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'create'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create PINs
              </button>
              <button
                onClick={() => {
                  setActiveTab('manage');
                  loadPINs();
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'manage'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage PINs
              </button>
            </nav>
          </div>
        </div>

        {/* Create PIN Tab */}
        {activeTab === 'create' && (
          <div className="bg-white shadow rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Create PIN Numbers
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Joining Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="joiningYear"
                  value={formData.joiningYear}
                  onChange={handleChange}
                  placeholder="e.g., 2023"
                  min="2000"
                  max="2100"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.joiningYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.joiningYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.joiningYear}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Enter the year students joined (e.g., 2025). PIN format will be: YY030-BRANCH-NUMBER
                </p>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.branch ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Branch</option>
                  {branchOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.branch && (
                  <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
                )}
              </div>

              {/* Year Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Year</option>
                  {yearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g., A, B, C"
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.section ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.section && (
                  <p className="mt-1 text-sm text-red-600">{errors.section}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Enter section letter(s) (e.g., A, B, C, or A1, B2)
                </p>
              </div>

              {/* Entry Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Entry Method <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="entryMethod"
                      value="range"
                      checked={formData.entryMethod === 'range'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Range (e.g., 1 to 60)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="entryMethod"
                      value="individual"
                      checked={formData.entryMethod === 'individual'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Individual (e.g., 1, 5, 10, 15)
                  </label>
                </div>
              </div>

              {/* Range Entry */}
              {formData.entryMethod === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="startSequence"
                      value={formData.startSequence}
                      onChange={handleChange}
                      placeholder="1"
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.startSequence ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startSequence && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.startSequence}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="endSequence"
                      value={formData.endSequence}
                      onChange={handleChange}
                      placeholder="60"
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.endSequence ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.endSequence && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.endSequence}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Individual Entry */}
              {formData.entryMethod === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Numbers <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="individualPINs"
                    value={formData.individualPINs}
                    onChange={handleChange}
                    placeholder="1, 5, 10, 15, 20"
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.individualPINs ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.individualPINs && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.individualPINs}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Enter PIN numbers separated by commas (e.g., 1, 5, 10, 15)
                  </p>
                </div>
              )}

              {/* Preview */}
              {formData.branch && formData.year && formData.section && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Preview (PINs that will be created):
                  </h3>
                  <div className="space-y-1">
                    {getPreviewPINs().map((pin, index) => (
                      <p key={index} className="text-sm text-gray-600 font-mono">
                        {pin}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating PINs...' : 'Create PINs'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manage PINs Tab */}
        {activeTab === 'manage' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Manage PIN Numbers
              </h2>
              {selectedPINs.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Selected ({selectedPINs.length})
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Year
                </label>
                <input
                  type="number"
                  name="joiningYear"
                  value={filters.joiningYear}
                  onChange={handleFilterChange}
                  placeholder="e.g., 2025"
                  min="2000"
                  max="2100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  name="branch"
                  value={filters.branch}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Branches</option>
                  {branchOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Years</option>
                  {yearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={filters.section}
                  onChange={handleFilterChange}
                  placeholder="Filter by section"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PINs Table */}
            {loadingPINs ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading PINs...</p>
              </div>
            ) : allPINs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No PINs found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPINs.length === allPINs.length && allPINs.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PIN Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allPINs.map((pin) => (
                      <tr key={pin.pin_number} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedPINs.includes(pin.pin_number)}
                            onChange={() => handleToggleSelect(pin.pin_number)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 font-mono">
                            {pin.pin_number}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pin.branch}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pin.year}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pin.section}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                              pin.status
                            )}`}
                          >
                            {pin.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(pin.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeletePIN(pin.pin_number)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}
            {errors.submit && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Results Count */}
            {!loadingPINs && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {allPINs.length} PIN(s)
                {selectedPINs.length > 0 && ` (${selectedPINs.length} selected)`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
