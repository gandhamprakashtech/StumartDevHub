import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getProducts } from '../services/productService';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // If category is 'all', don't pass category filter
        const filters = selectedCategory === 'all' ? {} : { category: selectedCategory };
        const result = await getProducts(filters);

        if (result.success) {
          setProducts(result.data || []);
        } else {
          setError(result.error || 'Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply sorting
    if (sortOrder === 'price-high-low') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOrder === 'price-low-high') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOrder === 'newest') {
      // Default is already sorted by newest from API
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredProducts(filtered);
  }, [products, sortOrder]);

  // Format price as currency
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) {
      return 'FREE';
    }
    return `₹ ${numPrice.toFixed(2)}`;
  };

  // Get first image from image_urls array
  const getFirstImage = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls[0];
    }
    // Placeholder image if no images
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Products</h1>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Products</h1>
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
  if (filteredProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Products</h1>
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Products Available</h2>
            <p className="text-gray-600 mb-6">
              There are no products available at the moment. Check back later!
            </p>
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            All Products
          </h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {/* Sort Dropdown */}
            <div className="flex-1">
              <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="price-low-high">Price: Low to High</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="books">Books</option>
                <option value="stationary">Stationary</option>
                <option value="electronics">Electronics</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {/* Product Image */}
              <div className="relative h-48 w-full bg-gray-200">
                <img
                  src={getFirstImage(product.image_urls)}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                  {product.title}
                </h3>
                <p className={`text-2xl font-bold ${parseFloat(product.price) === 0 ? 'text-green-600' : 'text-indigo-600'}`}>
  {formatPrice(product.price)}
</p>
              </div>
            </div>
          ))}
        </div>

        {/* Products Count */}
        <div className="mt-8 text-center text-gray-600">
          <p>Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
}


