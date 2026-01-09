import { supabase } from './supabaseClient';

/**
 * Image Upload Service
 * Handles uploading product images to Supabase Storage
 */

const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, or WEBP images only.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Generate unique file name for image
 * @param {string} userId - User ID (auth.uid())
 * @param {string} originalFileName - Original file name
 * @returns {string} Unique file path
 */
const generateFileName = (userId, originalFileName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = originalFileName.split('.').pop();
  return `${userId}/${timestamp}-${randomString}.${fileExtension}`;
};

/**
 * Upload a single image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID (auth.uid())
 * @returns {Promise<{success: boolean, url: string|null, error: string|null}>}
 */
export const uploadImage = async (file, userId) => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        url: null,
        error: validation.error,
      };
    }

    // Generate unique file name
    const fileName = generateFileName(userId, file.name);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        url: null,
        error: error.message || 'Failed to upload image',
      };
    }

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        url: null,
        error: 'Failed to get image URL',
      };
    }

    return {
      success: true,
      url: urlData.publicUrl,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error during image upload:', error);
    return {
      success: false,
      url: null,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {string} userId - User ID (auth.uid())
 * @param {Function} onProgress - Optional progress callback (index, total)
 * @returns {Promise<{success: boolean, urls: string[], errors: string[]}>}
 */
export const uploadMultipleImages = async (files, userId, onProgress) => {
  const urls = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    if (onProgress) {
      onProgress(i + 1, files.length);
    }

    const result = await uploadImage(files[i], userId);

    if (result.success) {
      urls.push(result.url);
    } else {
      errors.push(`Image ${i + 1}: ${result.error}`);
    }
  }

  return {
    success: urls.length > 0,
    urls,
    errors,
  };
};

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - Full URL or path of the image to delete
 * @param {string} userId - User ID (auth.uid()) for verification
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteImage = async (imageUrl, userId) => {
  try {
    // Extract file path from URL
    // Supabase Storage URLs format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = imageUrl.split('/');
    const pathIndex = urlParts.findIndex((part) => part === BUCKET_NAME);
    
    if (pathIndex === -1) {
      return {
        success: false,
        error: 'Invalid image URL',
      };
    }

    const filePath = urlParts.slice(pathIndex + 1).join('/');

    // Verify the file belongs to the user (path starts with userId)
    if (!filePath.startsWith(userId + '/')) {
      return {
        success: false,
        error: 'Unauthorized: You can only delete your own images',
      };
    }

    // Delete file
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete image',
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Get image preview URL (for displaying before upload)
 * @param {File} file - Image file
 * @returns {string} Object URL for preview
 */
export const getImagePreview = (file) => {
  if (!file) return null;
  return URL.createObjectURL(file);
};

/**
 * Revoke preview URL (cleanup)
 * @param {string} url - Preview URL to revoke
 */
export const revokeImagePreview = (url) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};

