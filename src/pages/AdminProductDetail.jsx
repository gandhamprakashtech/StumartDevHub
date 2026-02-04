import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentAdmin } from '../services/adminService';
import { getProductDetailForAdmin } from '../services/productService';

export default function AdminProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { admin: adminData, error: adminError } = await getCurrentAdmin();
        if (adminError || !adminData) {
          navigate('/admin/login');
          return;
        }
        setAdmin(adminData);

        const result = await getProductDetailForAdmin(id);
        if (result.success) {
          setProduct(result.data);
        } else {
          setError(result.error || 'Failed to load product');
        }
      } catch (err) {
        setError('Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !admin || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || 'Product not found'}</p>
      </div>
    );
  }

  const image =
    product.image_urls?.[0] ||
    'https://via.placeholder.com/500x400?text=No+Image';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
            aria-label="Back to products"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Detail</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Image */}
          <div className="lg:col-span-1">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={image}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {product.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Category: {product.category || 'N/A'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-md">
                <p className="text-xs text-gray-500">Price</p>
                <p className="font-semibold text-indigo-600">
                  {parseInt(product.price, 10) === 0 ? 'FREE' : `₹ ${product.price}`}
                </p>
              </div>

              <div className="bg-gray-50 px-4 py-2 rounded-md">
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold">
                  {product.status || 'Active'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500">Seller</p>
                <p className="font-medium">{product.students?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">PIN</p>
                <p className="font-medium">{product.student_pin_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium break-all">
                  {product.students?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description || 'No description provided.'}
          </p>
        </div>
      </div>
    </div>
  );
}
