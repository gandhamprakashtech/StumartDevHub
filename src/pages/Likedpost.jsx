import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function LikedPost() {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([]);

  // Load liked posts from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedPosts")) || [];
    setLikedPosts(stored);
  }, []);

  // Unlike (remove) product
  const handleUnlike = (id) => {
    const updated = likedPosts.filter((item) => item.id !== id);
    setLikedPosts(updated);
    localStorage.setItem("likedPosts", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ❤️ Liked Posts
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* Empty State */}
        {likedPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No liked posts
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Like some products to see them here.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {likedPosts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                {/* Image */}
                <div
                  className="h-48 bg-gray-200 cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <img
                    src={product.image_urls?.[0] || "https://via.placeholder.com/300"}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {product.title}
                  </h3>

                  <p className="text-indigo-600 font-bold mt-1">
                    {product.price === 0 ? "FREE" : `₹ ${product.price}`}
                  </p>

                  {/* Unlike Button */}
                  <button
                    onClick={() => handleUnlike(product.id)}
                    className="mt-3 w-full py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium"
                  >
                    💔 Unlike
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
