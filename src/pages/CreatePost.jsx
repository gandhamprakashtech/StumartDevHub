import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser } from '../services/authService';
import { createProduct } from '../services/productService';
import {
  uploadMultipleImages,
  getImagePreview,
  revokeImagePreview,
  validateImageFile,
} from '../services/imageUploadService';

export default function CreatePost() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // Form data
  const [formData, setFormData] = useState({
    branch: '', // Empty string means "All Branches"
    category: '',
    title: '',
    description: '',
    price: '',
  });

  // Image handling
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);

  // Form errors
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Branch options (extracted from PIN format: XX030-BRANCH-XXX)
  const branchOptions = [
    { value: '', label: 'All Branches' },
    { value: 'CM', label: 'Computer Science (CM)' },
    { value: 'M', label: 'Mechanical (M)' },
    { value: 'EC', label: 'Electronics (EC)' },
    { value: 'EE', label: 'Electrical (EE)' },
    { value: 'CE', label: 'Civil (CE)' },
    { value: 'IT', label: 'Information Technology (IT)' },
  ];

  const categoryOptions = [
    { value: 'books', label: 'Books' },
    { value: 'stationary', label: 'Stationary' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'others', label: 'Others' },
  ];

  /**
   * Load current user data
   */
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
   * Cleanup image previews on unmount
   */
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => revokeImagePreview(preview));
    };
  }, []);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  /**
   * Handle image selection
   */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];
    const validFiles = [];
    const newPreviews = [];

    files.forEach((file, index) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
        newPreviews.push(getImagePreview(file));
      } else {
        newErrors.push(`Image ${selectedImages.length + index + 1}: ${validation.error}`);
      }
    });

    if (newErrors.length > 0) {
      setImageErrors((prev) => [...prev, ...newErrors]);
    }

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }

    // Reset input
    e.target.value = '';
  };

  /**
   * Remove image from selection
   */
  const handleRemoveImage = (index) => {
    // Revoke preview URL
    revokeImagePreview(imagePreviews[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageErrors((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = 'Please enter a valid price (0 or greater)';
      }
    }

    if (selectedImages.length === 0) {
      newErrors.images = 'Please select at least one image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!user || !student) {
      setSubmitError('User session expired. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress({ current: 0, total: selectedImages.length });

    try {
      // Step 1: Upload images
      const uploadResult = await uploadMultipleImages(
        selectedImages,
        user.id,
        (current, total) => {
          setUploadProgress({ current, total });
        }
      );

      if (!uploadResult.success || uploadResult.urls.length === 0) {
        setSubmitError(
          uploadResult.errors.length > 0
            ? `Failed to upload images: ${uploadResult.errors.join(', ')}`
            : 'Failed to upload images. Please try again.'
        );
        setIsSubmitting(false);
        return;
      }

      // Step 2: Create product
      const productData = {
        branch: formData.branch || null, // null means "All Branches"
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        imageUrls: uploadResult.urls,
      };

      const result = await createProduct(productData);

      if (result.success) {
        setSuccessMessage('Post created successfully! Redirecting...');
        
        // Cleanup image previews
        imagePreviews.forEach((preview) => revokeImagePreview(preview));

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setSubmitError(result.error || 'Failed to create post. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="mt-2 text-sm text-gray-600">
            Share your product with other students
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Branch Selection */}
          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
              Branch <span className="text-gray-500">(Optional)</span>
            </label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.branch ? 'border-red-500' : 'border-gray-300'
              }`}
            >
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

          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="Enter product title"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex justify-between">
              {errors.title ? (
                <p className="text-sm text-red-600">{errors.title}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  {formData.title.length}/255 characters
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe your product in detail..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex justify-between">
              {errors.description ? (
                <p className="text-sm text-red-600">{errors.description}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  {formData.description.length} characters
                  {formData.description.length < 10 && ' (minimum 10 characters)'}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-4h12m-4-4v12m0 0v4a4 4 0 01-4 4H12a4 4 0 01-4-4v-4"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload images</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleImageSelect}
                      disabled={isSubmitting}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to 5MB each
                </p>
              </div>
            </div>

            {/* Image Errors */}
            {imageErrors.length > 0 && (
              <div className="mt-2 space-y-1">
                {imageErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.images && (
              <p className="mt-2 text-sm text-red-600">{errors.images}</p>
            )}

            {selectedImages.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {selectedImages.length} image(s) selected
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress.total > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-800">
                  Uploading images...
                </span>
                <span className="text-sm text-indigo-600">
                  {uploadProgress.current} / {uploadProgress.total}
                </span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  <script type="module" src="/auth.js"></script>
}

