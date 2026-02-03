import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getProducts } from "../services/productService";
import FilterSidebar from "../components/products/FilterSidebar";
import ProductCard from "../components/products/ProductCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  categoryOptions,
  branchOptions,
  priceRangeOptions,
} from "../constants/filterOptions";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [likedIds, setLikedIds] = useLocalStorage("likedPosts", []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    branch: false,
    price: false,
    free: false,
  });

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
          setError(result.error || "Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("An unexpected error occurred");
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
        const descriptionMatch = product.description
          ?.toLowerCase()
          .includes(query);
        return titleMatch || descriptionMatch;
      });
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category),
      );
    }

    if (selectedBranches.length > 0) {
      filtered = filtered.filter(
        (product) =>
          !product.branch || selectedBranches.includes(product.branch),
      );
    }

    if (selectedPriceRange !== "all") {
      const rangeOption = priceRangeOptions.find(
        (opt) => opt.value === selectedPriceRange,
      );
      if (rangeOption) {
        filtered = filtered.filter((product) => {
          const price = parseFloat(product.price) || 0;
          const min = rangeOption.min;
          const max =
            rangeOption.max === Infinity
              ? Number.MAX_SAFE_INTEGER
              : rangeOption.max;
          return price >= min && price <= max;
        });
      }
    }

    if (showFreeOnly) {
      filtered = filtered.filter((product) => parseFloat(product.price) === 0);
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setFilteredProducts(filtered);
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedBranches,
    selectedPriceRange,
    showFreeOnly,
  ]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleBranch = (branch) => {
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch],
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBranches([]);
    setSelectedPriceRange("all");
    setShowFreeOnly(false);
    setSearchQuery("");
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedBranches.length +
    (selectedPriceRange !== "all" ? 1 : 0) +
    (showFreeOnly ? 1 : 0);

  const toggleLike = (e, product) => {
    e.stopPropagation();

    // Check if the product is already liked
    const isLiked = likedIds.some(
      (item) => (typeof item === "object" ? item.id : item) === product.id,
    );

    let updatedLikedPosts;
    if (isLiked) {
      // Remove the product from liked list
      updatedLikedPosts = likedIds.filter(
        (item) => (typeof item === "object" ? item.id : item) !== product.id,
      );
    } else {
      // Add the product to liked list
      updatedLikedPosts = [...likedIds, product];
    }

    setLikedIds(updatedLikedPosts);
  };

  const getLikedIdsList = () => {
    if (Array.isArray(likedIds)) {
      return likedIds.map((item) =>
        typeof item === "object" ? item.id : item,
      );
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Browse Products
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Browse Products
          </h1>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Browse Products
          </h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Products Available
            </h2>
            <p className="text-gray-600">
              There are no products at the moment. Check back later!
            </p>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
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
              )}
            </div>
            <button
              onClick={() => navigate("/liked-post")}
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
            <FilterSidebar
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              selectedCategories={selectedCategories}
              selectedBranches={selectedBranches}
              selectedPriceRange={selectedPriceRange}
              showFreeOnly={showFreeOnly}
              toggleCategory={toggleCategory}
              toggleBranch={toggleBranch}
              setSelectedPriceRange={setSelectedPriceRange}
              setShowFreeOnly={setShowFreeOnly}
              clearAllFilters={clearAllFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredProducts.length} Product
                {filteredProducts.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {/* Applied Filters Chips */}
            {(selectedCategories.length > 0 ||
              selectedBranches.length > 0 ||
              showFreeOnly ||
              selectedPriceRange !== "all") && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {categoryOptions.find((o) => o.value === cat)?.label}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="hover:text-indigo-600"
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
                  </span>
                ))}
                {selectedBranches.map((branch) => (
                  <span
                    key={branch}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {branchOptions.find((o) => o.value === branch)?.label}
                    <button
                      onClick={() => toggleBranch(branch)}
                      className="hover:text-indigo-600"
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
                  </span>
                ))}
                {showFreeOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    Free Items
                    <button
                      onClick={() => setShowFreeOnly(false)}
                      className="hover:text-indigo-600"
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
                  </span>
                )}
                {selectedPriceRange !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {
                      priceRangeOptions.find(
                        (o) => o.value === selectedPriceRange,
                      )?.label
                    }
                    <button
                      onClick={() => setSelectedPriceRange("all")}
                      className="hover:text-indigo-600"
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
                  </span>
                )}
              </div>
            )}

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isLiked={getLikedIdsList().includes(product.id)}
                    onToggleLike={toggleLike}
                    onClick={() => navigate(`/products/${product.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No Products Found
                </h2>
                <p className="text-gray-600 mb-6">
                  No products match your filters. Try adjusting your search or
                  filters.
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
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden overflow-y-auto">
            <FilterSidebar
              isMobile={true}
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              selectedCategories={selectedCategories}
              selectedBranches={selectedBranches}
              selectedPriceRange={selectedPriceRange}
              showFreeOnly={showFreeOnly}
              toggleCategory={toggleCategory}
              toggleBranch={toggleBranch}
              setSelectedPriceRange={setSelectedPriceRange}
              setShowFreeOnly={setShowFreeOnly}
              clearAllFilters={clearAllFilters}
              activeFilterCount={activeFilterCount}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
