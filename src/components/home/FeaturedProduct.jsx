import React from "react";
import { useNavigate } from "react-router";

export default function FeaturedProduct({ product, index, currentIndex }) {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    const numPrice = parseInt(price, 10);
    if (numPrice === 0) return "FREE";
    return `₹ ${numPrice.toFixed(0)}`;
  };

  const getFirstImage = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls[0];
    }
    return "https://via.placeholder.com/400x300?text=No+Image";
  };
  return (
    <div
      key={`${product.id}-${index}`}
      onClick={() => navigate(`/products/${product.id}`)}
      className={`min-w-[300px] mx-3 bg-white rounded-xl shadow-md cursor-pointer transition-all duration-500
                      ${
                        index === currentIndex
                          ? "scale-110 shadow-xl z-10"
                          : "scale-95 opacity-80"
                      }
                    `}
    >
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        <img
          src={getFirstImage(product.image_urls)}
          alt={product.title}
          className="w-full h-full object-contain bg-gray-50"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
          }}
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        <p
          className={`text-xl font-bold ${
            parseInt(product.price, 10) === 0
              ? "text-green-600"
              : "text-indigo-600"
          }`}
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}
