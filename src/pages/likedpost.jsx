import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LikedPost() {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("likedPosts")) || [];
    setLikedPosts(data);
  }, []);

  const unlike = (id) => {
    const updated = likedPosts.filter(p => p.id !== id);
    setLikedPosts(updated);
    localStorage.setItem("likedPosts", JSON.stringify(updated));
  };

  if (likedPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No liked products ❤️
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">❤️ Liked Products</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {likedPosts.map(product => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="bg-white shadow rounded cursor-pointer hover:shadow-lg"
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={product.image_urls?.[0] || "https://via.placeholder.com/400"}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    unlike(product.id);
                  }}
                  className="absolute top-2 right-2 bg-pink-500 p-2 rounded-full text-white"
                >
                  ❤️
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-indigo-600 font-bold">₹ {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
