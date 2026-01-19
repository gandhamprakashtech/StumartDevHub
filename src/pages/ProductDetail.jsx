import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getProductById } from '../services/productService';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getProductById(id);

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          setError(result.error || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Format price as currency
  const formatPrice = (price) => {
    return `₹ ${parseFloat(price).toFixed(2)}`;
  };

  // Format category name
  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Format branch name
  const formatBranch = (branch) => {
    if (!branch) return 'All Branches';
    return branch;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error || 'Product not found'}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const seller = product.students || {};
  const images = product.image_urls || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="mb-4">
                <img
                  src={images[selectedImageIndex] || 'https://via.placeholder.com/600x400?text=No+Image'}
                  alt={product.title}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        selectedImageIndex === index
                          ? 'border-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x100?text=No+Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              {/* Category & Branch Badges */}
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  {formatCategory(product.category)}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {formatBranch(product.branch)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-indigo-600">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Seller Information */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <p className="text-gray-900 font-medium">{seller.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">PIN Number:</span>
                    <p className="text-gray-900 font-mono">{seller.pin_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="text-gray-900">{seller.email || '--'}</p>
                  </div>
                </div>
              </div>

              {/* Posted Date */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Posted on {new Date(product.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

