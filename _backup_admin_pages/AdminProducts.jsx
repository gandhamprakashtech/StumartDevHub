import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentAdmin } from "../services/adminService";
import { getAllProductsForAdmin, adminDeleteProduct } from "../services/productService";

export default function AdminProducts() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* ---------------- FILTER STATE ---------------- */
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  /* ---------------- OPTIONS ---------------- */
  const categoryOptions = [
    { value: "books", label: "Books" },
    { value: "stationary", label: "Stationary" },
    { value: "electronics", label: "Electronics" },
    { value: "others", label: "Others" },
  ];

  const branchOptions = [
    { value: "CME", label: "CME (Computer Science)" },
    { value: "CE", label: "CE (Civil)" },
    { value: "M", label: "M (Mechanical)" },
    { value: "ECE", label: "ECE" },
    { value: "EEE", label: "EEE" },
    { value: "CIOT", label: "CIOT" },
    { value: "AIML", label: "AIML" },
  ];

  const priceOptions = [
    { value: "all", label: "All Prices" },
    { value: "0-100", label: "₹0 - ₹100" },
    { value: "100-500", label: "₹100 - ₹500" },
    { value: "500-1000", label: "₹500 - ₹1000" },
    { value: "1000-5000", label: "₹1000 - ₹5000" },
    { value: "5000+", label: "₹5000+" },
  ];

  /* ---------------- LOAD ADMIN + PRODUCTS ---------------- */
  useEffect(() => {
    const load = async () => {
      const { admin } = await getCurrentAdmin();
      if (!admin) {
        navigate("/admin/login");
        return;
      }

      setAdmin(admin);

      const res = await getAllProductsForAdmin();
      setProducts(res.data || []);
      setIsLoading(false);
    };
    load();
  }, [navigate]);

  /* ---------------- FILTER LOGIC ---------------- */
  useEffect(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.student_pin_number?.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length) {
      list = list.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedBranches.length) {
      list = list.filter(p => selectedBranches.includes(p.branch));
    }

    if (showFreeOnly) {
      list = list.filter(p => parseInt(p.price) === 0);
    }

    if (selectedPriceRange !== "all") {
      const [min, max] =
        selectedPriceRange === "5000+"
          ? [5000, Infinity]
          : selectedPriceRange.split("-").map(Number);

      list = list.filter(p => {
        const price = parseInt(p.price || 0);
        return price >= min && price <= max;
      });
    }

    setFilteredProducts(list);
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedBranches,
    selectedPriceRange,
    showFreeOnly,
  ]);

  /* ---------------- HELPERS ---------------- */
  const getImage = imgs =>
    imgs?.length ? imgs[0] : "https://via.placeholder.com/400x300";

  const handleDelete = async id => {
    if (!window.confirm("Delete this product?")) return;
    if (!window.confirm("This is permanent. Confirm delete.")) return;

    setDeletingId(id);
    await adminDeleteProduct(id);
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, status: "inactive" } : p))
    );
    setDeletingId(null);
  };

  if (isLoading) {
    return <div className="p-10 text-center">Loading…</div>;
  }

  /* ---------------- FILTER SIDEBAR ---------------- */
  const activeFilterCount =
    selectedCategories.length +
    selectedBranches.length +
    (selectedPriceRange !== "all" ? 1 : 0) +
    (showFreeOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBranches([]);
    setSelectedPriceRange("all");
    setShowFreeOnly(false);
  };

  const FilterSidebar = ({ isMobile = false }) => (
    <div className="w-full lg:w-64 bg-white border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {isMobile && (
          <button onClick={() => setIsFilterOpen(false)}>✕</button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold mb-2">Category</p>
          {categoryOptions.map(c => (
            <label key={c.value} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(c.value)}
                onChange={() =>
                  setSelectedCategories(prev =>
                    prev.includes(c.value)
                      ? prev.filter(x => x !== c.value)
                      : [...prev, c.value]
                  )
                }
              />
              {c.label}
            </label>
          ))}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-2">Branch</p>
          {branchOptions.map(b => (
            <label key={b.value} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedBranches.includes(b.value)}
                onChange={() =>
                  setSelectedBranches(prev =>
                    prev.includes(b.value)
                      ? prev.filter(x => x !== b.value)
                      : [...prev, b.value]
                  )
                }
              />
              {b.label}
            </label>
          ))}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-2">Price</p>
          {priceOptions.map(r => (
            <label key={r.value} className="flex gap-2 text-sm">
              <input
                type="radio"
                name="price"
                checked={selectedPriceRange === r.value}
                onChange={() => setSelectedPriceRange(r.value)}
              />
              {r.label}
            </label>
          ))}
        </div>

        <div className="border-t pt-4">
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={showFreeOnly}
              onChange={e => setShowFreeOnly(e.target.checked)}
            />
            Free only
          </label>
        </div>

        <button
          onClick={clearAllFilters}
          className="w-full border rounded py-2 text-sm"
        >
          Clear filters
        </button>
      </div>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEARCH */}
      <div className="bg-white p-4 flex gap-3 items-center sticky top-0 z-10">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          aria-label="Back to dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search products…"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden border px-3 py-2 rounded"
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      <div className="flex gap-6 p-4">
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        {/* PRODUCTS GRID */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <div
              key={p.id}
              className="bg-white rounded shadow-sm overflow-hidden flex flex-col lg:rounded-md"
            >
              <div className="aspect-[4/3] lg:aspect-[16/9] bg-gray-100">
                <img
                  src={getImage(p.image_urls)}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3 lg:p-2 flex flex-col flex-1 space-y-2">
                <Link
                  to={`/admin/products/${p.id}`}
                  className="font-semibold hover:text-indigo-600 text-sm lg:text-[13px]"
                >
                  {p.title}
                </Link>

                <p className="text-sm text-gray-600 lg:text-xs">
                  {parseInt(p.price, 10) === 0 ? "FREE" : `₹ ${parseInt(p.price, 10)}`}
                </p>

                {/* PERFECTLY ALIGNED BUTTONS */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Link
                    to={`/admin/products/${p.id}`}
                    className="h-9 lg:h-8 flex items-center justify-center bg-indigo-600 text-white text-sm lg:text-xs rounded"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="h-9 lg:h-8 flex items-center justify-center bg-red-600 text-white text-sm lg:text-xs rounded disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE FILTER */}
      {isFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 overflow-y-auto">
            <FilterSidebar isMobile />
          </div>
        </>
      )}
    </div>
  );
}
