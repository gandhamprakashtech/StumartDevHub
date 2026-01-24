import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { getMyProducts, deleteProduct } from '../services/productService';
import { getCurrentUser } from '../services/authService';

export default function MyPosts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchMyProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check authentication first
        const { user, student, error: authError } = await getCurrentUser();
        
        if (authError || !user || !student) {
          navigate('/login');
          return;
        }

        // Fetch user's products
        const result = await getMyProducts();
        
        if (result.success) {
          setProducts(result.data || []);
        } else {
          setError(result.error || 'Failed to load your posts');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProducts();
  }, [navigate]);

  // Handle product deletion
  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingId(productId);

    try {
      const result = await deleteProduct(productId);
      
      if (result.success) {
        // Remove product from local state
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert(result.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('An unexpected error occurred while deleting the post');
    } finally {
      setDeletingId(null);
    }
  };

  // Format price as currency
  const formatPrice = (price) => {
    return `₹ ${parseFloat(price).toFixed(2)}`;
  };

  // Get first image from image_urls array
  const getFirstImage = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls[0];
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Posts</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Posts</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Posts</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Posts Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't created any posts yet. Start by creating your first post!
            </p>
            <Link
              to="/create-post"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Post
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Products grid
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Your Posts
            </h1>
            <p className="text-gray-600">Manage and view all your product posts</p>
          </div>
         
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Product Image */}
              <div 
                className="relative h-48 w-full bg-gray-200 cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <img
                  src={getFirstImage(product.image_urls)}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 
                  className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.title}
                </h3>
                <p className="text-2xl font-bold text-indigo-600 mb-2">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Created: {formatDate(product.created_at)}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {deletingId === product.id ? (
                      <svg className="animate-spin h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Count */}
        <div className="mt-8 text-center text-gray-600">
          <p>You have {products.length} post{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
}

