const getSafeDateValue = (dateString) => {
  const dateValue = new Date(dateString).getTime();
  return Number.isNaN(dateValue) ? 0 : dateValue;
};

export const applyProductFilters = (products, options) => {
  const {
    searchQuery,
    selectedCategories,
    selectedBranches,
    selectedPriceRange,
    showFreeOnly,
    sortOrder,
    priceRangeOptions,
    searchFields = ['title', 'description'],
  } = options;

  let filtered = [...products];
  const query = searchQuery?.trim().toLowerCase();

  if (query) {
    filtered = filtered.filter((product) =>
      searchFields.some((field) => {
        const value = field.split('.').reduce((acc, key) => acc?.[key], product);
        return value?.toString().toLowerCase().includes(query);
      })
    );
  }

  if (selectedCategories?.length) {
    filtered = filtered.filter((product) => selectedCategories.includes(product.category));
  }

  if (selectedBranches?.length) {
    filtered = filtered.filter((product) =>
      !product.branch || selectedBranches.includes(product.branch)
    );
  }

  if (selectedPriceRange && selectedPriceRange !== 'all') {
    const rangeOption = priceRangeOptions?.find((opt) => opt.value === selectedPriceRange);
    if (rangeOption) {
      const maxValue = rangeOption.max === Infinity ? Number.MAX_SAFE_INTEGER : rangeOption.max;
      filtered = filtered.filter((product) => {
        const price = parseInt(product.price, 10) || 0;
        return price >= rangeOption.min && price <= maxValue;
      });
    }
  }

  if (showFreeOnly) {
    filtered = filtered.filter((product) => parseInt(product.price, 10) === 0);
  }

  if (sortOrder === 'price-high-low') {
    filtered.sort((a, b) => (parseInt(b.price, 10) || 0) - (parseInt(a.price, 10) || 0));
  } else if (sortOrder === 'price-low-high') {
    filtered.sort((a, b) => (parseInt(a.price, 10) || 0) - (parseInt(b.price, 10) || 0));
  } else if (sortOrder === 'newest') {
    filtered.sort((a, b) => getSafeDateValue(b.created_at) - getSafeDateValue(a.created_at));
  }

  return filtered;
};

export const getActiveFilterCount = ({
  selectedCategories,
  selectedBranches,
  selectedPriceRange,
  showFreeOnly,
}) => {
  return (selectedCategories?.length || 0)
    + (selectedBranches?.length || 0)
    + (selectedPriceRange && selectedPriceRange !== 'all' ? 1 : 0)
    + (showFreeOnly ? 1 : 0);
};
