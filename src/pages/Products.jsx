import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getProducts } from '../services/productService';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Price range options
  const priceRangeOptions = [
    { value: 'all', label: 'All Prices', min: 0, max: Infinity },
    { value: '0', label: '₹0 (Free)', min: 0, max: 0 },
    { value: '1-100', label: '₹1 - ₹100', min: 1, max: 100 },
    { value: '100-500', label: '₹100 - ₹500', min: 100, max: 500 },
    { value: '500-1000', label: '₹500 - ₹1000', min: 500, max: 1000 },
    { value: '1000-5000', label: '₹1000 - ₹5000', min: 1000, max: 5000 },
    { value: '5000+', label: '₹5000+', min: 5000, max: Infinity },
  ];

  const categoryOptions = [
    { value: 'books', label: 'Books' },
    { value: 'stationary', label: 'Stationary' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'others', label: 'Others' },
  ];

  const branchOptions = [
    { value: 'CME', label: 'CME (Computer Science)' },
    { value: 'CE', label: 'CE (Civil)' },
    { value: 'M', label: 'M (Mechanical)' },
    { value: 'ECE', label: 'ECE' },
    { value: 'EEE', label: 'EEE' },
    { value: 'CIOT', label: 'CIOT' },
    { value: 'AIML', label: 'AIML' },
  ];

  // Load liked products from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('likedPosts')) || [];
    setLikedIds(stored.map(p => p.id));
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getProducts({});
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
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const titleMatch = product.title?.toLowerCase().includes(query);
        const descriptionMatch = product.description?.toLowerCase().includes(query);
        return titleMatch || descriptionMatch;
      });
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    if (selectedBranches.length > 0) {
      filtered = filtered.filter((product) =>
        !product.branch || selectedBranches.includes(product.branch)
      );
    }

    if (selectedPriceRange !== 'all') {
      const rangeOption = priceRangeOptions.find(opt => opt.value === selectedPriceRange);
      if (rangeOption) {
        filtered = filtered.filter((product) => {
          const price = parseFloat(product.price) || 0;
          const min = rangeOption.min;
          const max = rangeOption.max === Infinity ? Number.MAX_SAFE_INTEGER : rangeOption.max;
          return price >= min && price <= max;
        });
      }
    }

    if (showFreeOnly) {
      filtered = filtered.filter((product) => parseFloat(product.price) === 0);
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategories, selectedBranches, selectedPriceRange, showFreeOnly]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBranch = (branch) => {
    setSelectedBranches(prev =>
      prev.includes(branch)
        ? prev.filter(b => b !== branch)
        : [...prev, branch]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBranches([]);
    setSelectedPriceRange('all');
    setShowFreeOnly(false);
    setSearchQuery('');
  };

  const activeFilterCount = selectedCategories.length + selectedBranches.length +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    (showFreeOnly ? 1 : 0);

  const toggleLike = (e, product) => {
    e.stopPropagation();
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
    const isLiked = likedIds.includes(product.id);
    if (isLiked) {
      likedPosts = likedPosts.filter(p => p.id !== product.id);
      setLikedIds(prev => prev.filter(id => id !== product.id));
    } else {
      likedPosts.push(product);
      setLikedIds(prev => [...prev, product.id]);
    }
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return 'FREE';
    return `₹ ${numPrice.toFixed(2)}`;
  };

  const getFirstImage = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) return imageUrls[0];
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }) => {
    const [expandedSections, setExpandedSections] = useState({
      category: true,
      branch: true,
      price: true,
      free: true,
    });

    const toggleSection = (section) => {
      setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
      <div className={`bg-white rounded-lg shadow-sm ${isMobile ? 'w-full' : 'w-64'} border border-gray-200`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {isMobile && (
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Category */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between text-left mb-2"
            >
              <h4 className="font-semibold text-gray-900">Category</h4>
              <svg
                className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.category ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.category && (
              <div className="space-y-2 mt-2">
                {categoryOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(option.value)}
                      onChange={() => toggleCategory(option.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Branch */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('branch')}
              className="w-full flex items-center justify-between text-left mb-2"
            >
              <h4 className="font-semibold text-gray-900">Branch</h4>
              <svg
                className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.branch ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.branch && (
              <div className="space-y-2 mt-2">
                {branchOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(option.value)}
                      onChange={() => toggleBranch(option.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="border-b border-gray-200 pb-4">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between text-left mb-2"
            >
              <h4 className="font-semibold text-gray-900">Price Range</h4>
              <svg
                className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.price && (
              <div className="mt-2 space-y-2">
                {priceRangeOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price-range"
                      value={option.value}
                      checked={selectedPriceRange === option.value}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Free Items */}
          <div className="pb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-900">Free Items Only</span>
            </label>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Products</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Products</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Products</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Products Available</h2>
            <p className="text-gray-600">There are no products at the moment. Check back later!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => navigate('/liked-post')}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 whitespace-nowrap"
            >
              ❤️ Liked Posts
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">{activeFilterCount}</span>
                )}
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {/* Applied Filters Chips */}
            {(selectedCategories.length > 0 || selectedBranches.length > 0 || showFreeOnly || selectedPriceRange !== 'all') && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {categoryOptions.find(o => o.value === cat)?.label}
                    <button onClick={() => toggleCategory(cat)} className="hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {selectedBranches.map((branch) => (
                  <span key={branch} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {branchOptions.find(o => o.value === branch)?.label}
                    <button onClick={() => toggleBranch(branch)} className="hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {showFreeOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    Free Items
                    <button onClick={() => setShowFreeOnly(false)} className="hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedPriceRange !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {priceRangeOptions.find(o => o.value === selectedPriceRange)?.label}
                    <button onClick={() => setSelectedPriceRange('all')} className="hover:text-indigo-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const isLiked = likedIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="relative h-48 w-full bg-gray-200">
                        <img
                          src={getFirstImage(product.image_urls)}
                          alt={product.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                        />
                        <button
                          onClick={(e) => toggleLike(e, product)}
                          className={`absolute top-2 right-2 p-2 rounded-full transition ${isLiked ? 'bg-pink-500 scale-110' : 'bg-white'}`}
                        >
                          <svg
                            className={`w-5 h-5 ${isLiked ? 'text-white' : 'text-pink-600'}`}
                            fill={isLiked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                          {product.title}
                        </h3>
                        <p className={`text-2xl font-bold ${parseFloat(product.price) === 0 ? 'text-green-600' : 'text-indigo-600'}`}>
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Products Found</h2>
                <p className="text-gray-600 mb-6">
                  No products match your filters. Try adjusting your search or filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsFilterOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden overflow-y-auto">
            <FilterSidebar isMobile={true} />
          </div>
        </>
      )}
    </div>
  );
}
