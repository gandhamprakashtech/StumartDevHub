import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getProducts } from '../services/productService';

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* Load liked products */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('likedPosts')) || [];
    setLikedIds(stored.map(p => p.id));
  }, []);

  /* Fetch products */
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await getProducts({});
      if (res.success) setProducts(res.data);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  /* LIKE ↔ UNLIKE */
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

  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products</h1>

          {/* ✅ NAVIGATE TO LIKED POST */}
          <button
            onClick={() => navigate('/liked-post')}
            className="px-4 py-2 bg-pink-600 text-white rounded"
          >
            ❤️ Liked Posts
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => {
            const isLiked = likedIds.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white shadow rounded cursor-pointer hover:shadow-lg"
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={product.image_urls?.[0] || 'https://via.placeholder.com/400'}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />

                  {/* ❤️ TOGGLE */}
                  <button
                    onClick={(e) => toggleLike(e, product)}
                    className={`absolute top-2 right-2 p-2 rounded-full transition
                      ${isLiked ? 'bg-pink-500 scale-110' : 'bg-white'}
                    `}
                  >
                    <svg
                      className={`w-5 h-5 ${isLiked ? 'text-white' : 'text-pink-600'}`}
                      fill={isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-indigo-600 font-bold">₹ {product.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
