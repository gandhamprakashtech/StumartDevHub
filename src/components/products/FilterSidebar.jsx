import React from "react";
import {
  categoryOptions,
  branchOptions,
  priceRangeOptions,
} from "../../constants/filterOptions";

export default function FilterSidebar({
  expandedSections,
  setExpandedSections,
  selectedCategories,
  selectedBranches,
  selectedPriceRange,
  showFreeOnly,
  toggleCategory,
  toggleBranch,
  setSelectedPriceRange,
  setShowFreeOnly,
  clearAllFilters,
  activeFilterCount,
  isMobile = false,
  onClose,
}) {
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${isMobile ? "w-full" : "w-64"} border border-gray-200`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {isMobile && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
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

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Category */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleSection("category")}
            className="w-full flex items-center justify-between text-left mb-2"
          >
            <h4 className="font-semibold text-gray-900">Category</h4>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.category ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expandedSections.category && (
            <div className="space-y-2 mt-2">
              {categoryOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
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
            onClick={() => toggleSection("branch")}
            className="w-full flex items-center justify-between text-left mb-2"
          >
            <h4 className="font-semibold text-gray-900">Branch</h4>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.branch ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expandedSections.branch && (
            <div className="space-y-2 mt-2">
              {branchOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
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
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between text-left mb-2"
          >
            <h4 className="font-semibold text-gray-900">Price Range</h4>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedSections.price ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expandedSections.price && (
            <div className="mt-2 space-y-2">
              {priceRangeOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
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
            <span className="text-sm font-medium text-gray-900">
              Free Items Only
            </span>
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
}
