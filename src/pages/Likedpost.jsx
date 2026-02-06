import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function LikedPost() {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([]);
  const [removingId, setRemovingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, free, paid

  // Load liked posts from localStorage
  useEffect(() => {
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("likedPosts")) || [];
      setLikedPosts(stored);
      setIsLoading(false);
    }, 300);
  }, []);

  // Filter posts
  const filteredPosts = likedPosts.filter(post => {
    const price = parseInt(post.price, 10) || 0;
    if (filter === 'free') return price === 0;
    if (filter === 'paid') return price > 0;
    return true;
  });

  // Unlike (remove) product with animation
  const handleUnlike = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      const updated = likedPosts.filter((item) => item.id !== id);
      setLikedPosts(updated);
      localStorage.setItem("likedPosts", JSON.stringify(updated));
      setRemovingId(null);
    }, 400);
  };

  // Clear all liked posts
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all liked posts?')) {
      setLikedPosts([]);
      localStorage.setItem("likedPosts", JSON.stringify([]));
    }
  };

  // Format price
  const formatPrice = (price) => {
    const numPrice = parseInt(price, 10) || 0;
    if (numPrice === 0) return 'FREE';
    return `₹ ${numPrice}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8 px-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Liked Posts
                </h1>
                <p className="text-gray-600 mt-1">
                  {likedPosts.length} {likedPosts.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>

          {/* Filter Tabs & Clear All */}
          {likedPosts.length > 0 && (
            <div className="flex items-center justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All ({likedPosts.length})
                </button>
                <button
                  onClick={() => setFilter('free')}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    filter === 'free'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Free ({likedPosts.filter(p => (parseInt(p.price, 10) || 0) === 0).length})
                </button>
                <button
                  onClick={() => setFilter('paid')}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    filter === 'paid'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Paid ({likedPosts.filter(p => (parseInt(p.price, 10) || 0) > 0).length})
                </button>
              </div>

              <button
                onClick={handleClearAll}
                className="px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : likedPosts.length === 0 ? (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-16 text-center border border-gray-200 animate-scale-in">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Liked Posts Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring and save your favorite products to see them here. Your liked items will be waiting for you!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Products
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Filtered Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-gray-200">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No {filter} items found
            </h3>
            <p className="text-gray-600">
              Try selecting a different filter to see your liked posts.
            </p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPosts.map((product, index) => (
              <div
                key={product.id}
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-pink-200 animate-fade-in-up ${
                  removingId === product.id ? 'animate-fade-out-down' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <div
                  className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <img
                    src={product.image_urls?.[0] || "https://via.placeholder.com/300"}
                    alt={product.title}
                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Floating Heart Badge */}
                  <div className="absolute top-3 right-3 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                    </svg>
                  </div>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium">Click to view details</p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[3rem] mb-3 group-hover:text-pink-600 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-xl font-bold ${
                      parseFloat(product.price) === 0 
                        ? 'text-green-600' 
                        : 'bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'
                    }`}>
                      {formatPrice(product.price)}
                    </p>
                    
                    {parseFloat(product.price) === 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        FREE
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium flex items-center justify-center gap-2 group"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    
                    <button
                      onClick={() => handleUnlike(product.id)}
                      className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:scale-105 transition-all duration-300 font-medium flex items-center justify-center group"
                      title="Unlike"
                    >
                      <svg className="w-5 h-5 group-hover:scale-125 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        @keyframes fade-out-down {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
        }
        .animate-fade-out-down {
          animation: fade-out-down 0.4s ease-out forwards;
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}