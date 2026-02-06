import React from 'react';

const formatPrice = (price) => {
  const numPrice = parseInt(price, 10) || 0;
  if (numPrice === 0) return 'FREE';
  return `₹ ${numPrice}`;
};

const getFirstImage = (imageUrls) => {
  if (imageUrls && imageUrls.length > 0) return imageUrls[0];
  return 'https://via.placeholder.com/400x300?text=No+Image';
};

export default function ProductCard({ product, isLiked, onToggleLike, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative h-48 w-full bg-gray-200">
        <img
          src={getFirstImage(product.image_urls)}
          alt={product.title}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(e) => { 
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; 
          }}
        />
        <button
          onClick={(e) => onToggleLike(e, product)}
          className={`absolute top-2 right-2 p-2 rounded-full transition ${
            isLiked ? 'bg-pink-500 scale-110' : 'bg-white'
          }`}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {product.title}
        </h3>
        <p className={`text-2xl font-bold ${
          parseInt(product.price, 10) === 0 ? 'text-green-600' : 'text-indigo-600'
        }`}>
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}