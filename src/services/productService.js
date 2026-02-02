import { supabase } from './supabaseClient';
import { getCurrentUser } from './authService';

/**
 * Product Service
 * Handles all product-related database operations
 */

/**
 * Create a new product post
 * @param {Object} productData - Product data
 * @param {string} productData.branch - Branch code or null for "All Branches"
 * @param {string} productData.category - Category (books, stationary, electronics, others)
 * @param {string} productData.title - Product title
 * @param {string} productData.description - Product description
 * @param {number} productData.price - Product price
 * @param {string[]} productData.imageUrls - Array of image URLs from Supabase Storage
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const createProduct = async (productData) => {
  try {
    // Get current user and student data
    const { user, student, error: userError } = await getCurrentUser();

    if (userError || !user || !student) {
      return {
        success: false,
        data: null,
        error: 'User not authenticated. Please log in to create a post.',
      };
    }
    
    // Validate required fields
    if (!productData.category || !productData.title || !productData.description || productData.price === undefined) {
      return {
        success: false,
        data: null,
        error: 'Please fill in all required fields',
      };
    }

    // Validate category
    const validCategories = ['books', 'stationary', 'electronics', 'others'];
    if (!validCategories.includes(productData.category)) {
      return {
        success: false,
        data: null,
        error: 'Invalid category selected',
      };
    }

    // Validate price
    if (productData.price < 0) {
      return {
        success: false,
        data: null,
        error: 'Price cannot be negative',
      };
    }

    // Validate images
    if (!productData.imageUrls || productData.imageUrls.length === 0) {
      return {
        success: false,
        data: null,
        error: 'Please upload at least one image',
      };
    }

    // Prepare product data for insertion
    const productInsert = {
      seller_id: user.id,
      student_pin_number: student.pin_number,
      branch: productData.branch || null, // null means "All Branches"
      category: productData.category,
      title: productData.title.trim(),
      description: productData.description.trim(),
      price: parseInt(productData.price, 10),
      image_urls: productData.imageUrls,
      status: 'active',
    };

    // Insert product into database
    const { data, error } = await supabase
      .from('products')
      .insert(productInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to create product. Please try again.',
      };
    }

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Get all active products
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {string} filters.branch - Filter by branch
 * @param {number} filters.limit - Limit number of results
 * @param {number} filters.offset - Offset for pagination
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>}
 */
export const getProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.branch) {
      query = query.or(`branch.is.null,branch.eq.${filters.branch}`);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to fetch products',
      };
    }

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Get a single product by ID with seller information
 * @param {string} productId - Product ID
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        students:student_pin_number (
          name,
          pin_number,
          email
        )
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Product not found',
      };
    }

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error fetching product:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Get products created by current user
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null}>}
 */
export const getMyProducts = async () => {
  try {
    const { user, error: userError } = await getCurrentUser();

    if (userError || !user) {
      return {
        success: false,
        data: null,
        error: 'User not authenticated',
      };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user products:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to fetch your products',
      };
    }

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error fetching user products:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Update a product
 * @param {string} productId - Product ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export const updateProduct = async (productId, updates) => {
  try {
    const { user, error: userError } = await getCurrentUser();

    if (userError || !user) {
      return {
        success: false,
        data: null,
        error: 'User not authenticated',
      };
    }

    // First, verify the product belongs to the user
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', productId)
      .single();

    if (fetchError || !existingProduct) {
      return {
        success: false,
        data: null,
        error: 'Product not found',
      };
    }

    if (existingProduct.seller_id !== user.id) {
      return {
        success: false,
        data: null,
        error: 'You can only update your own products',
      };
    }

    // Update product
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to update product',
      };
    }

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Delete a product (soft delete by setting status to 'inactive')
 * @param {string} productId - Product ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteProduct = async (productId) => {
  try {
    const { user, error: userError } = await getCurrentUser();

    if (userError || !user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // First, verify the product belongs to the user
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', productId)
      .single();

    if (fetchError || !existingProduct) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    if (existingProduct.seller_id !== user.id) {
      return {
        success: false,
        error: 'You can only delete your own products',
      };
    }

    // Soft delete by setting status to inactive
    const { error } = await supabase
      .from('products')
      .update({ status: 'inactive' })
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete product',
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

