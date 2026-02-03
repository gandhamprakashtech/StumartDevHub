import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getProductById } from '../services/productService';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [shortImageUrl, setShortImageUrl] = useState(null);
  //zoom
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });


  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getProductById(id);

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          setError(result.error || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Shorten image URL when product loads
  useEffect(() => {
    const shortenImageUrl = async () => {
      if (product && product.image_urls && product.image_urls.length > 0) {
        try {
          const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(product.image_urls[0])}`);
          const shortUrl = await response.text();
          if (shortUrl && shortUrl.startsWith('http')) {
            setShortImageUrl(shortUrl);
          } else {
            setShortImageUrl(product.image_urls[0]);
          }
        } catch (error) {
          console.error('Error shortening URL:', error);
          setShortImageUrl(product.image_urls[0]);
        }
      }
    };

    if (product) {
      shortenImageUrl();
    }
  }, [product]);

  // Format price as currency
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) {
      return 'FREE';
    }
    return `₹ ${numPrice.toFixed(2)}`;
  };

  // Format category name
  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Format branch name
  const formatBranch = (branch) => {
    if (!branch) return 'All Branches';
    return branch;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error || 'Product not found'}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const seller = product.students || {};
  const images = product.image_urls || [];
  const imageUrlForWhatsApp = shortImageUrl || (images.length > 0 ? images[0] : 'N/A');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="mb-4">
                <img
                  src={images[selectedImageIndex] || 'https://via.placeholder.com/600x400'}
                  alt={product.title}
                  className="w-full h-96 object-contain rounded-lg cursor-zoom-in hover:cursor-zoom-in transition-transform hover:scale-105"
                  onClick={() => {
                  setIsZoomOpen(true);
                  setZoomScale(1);
                  setPosition({ x: 0, y: 0 });
                  }}
                />

              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`border-2 rounded-lg overflow-hidden transition-all hover:cursor-pointer ${selectedImageIndex === index
                          ? 'border-indigo-600'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x100?text=No+Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              {/* Category & Branch Badges */}
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  {formatCategory(product.category)}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {formatBranch(product.branch)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              {/* Price */}
              <div className="mb-6">
              <p className={`text-4xl font-bold ${parseFloat(product.price) === 0 ? 'text-green-600' : 'text-indigo-600'}`}>
  {formatPrice(product.price)}
</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Seller Information */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <p className="text-gray-900 font-medium">{seller.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">PIN Number:</span>
                    <p className="text-gray-900 font-mono">{seller.pin_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="text-gray-900">{seller.email || '--'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Admin Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Admin</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone Call Button */}
                  <a
                    href="tel:9392668228"
                    className="inline-flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Admin
                  </a>

                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/919392668228?text=${encodeURIComponent(
                      `Hello! 👋\n\nI need help regarding this product:\n\n📦 Product: ${product.title}\n\n💰 Price: ${formatPrice(product.price)}\n\n🖼️ Product Image: ${imageUrlForWhatsApp}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp Admin
                  </a>
                </div>
              </div>

              {/* Posted Date */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Posted on {new Date(product.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-default"
          onClick={() => setIsZoomOpen(false)}
         >
         <img
          src={images[selectedImageIndex]}
          alt="Zoomed product"
          className={`max-w-none select-none cursor-zoom-in `}
          style={{
          transform: `scale(${zoomScale}) translate(${position.x}px, ${position.y}px)`
          }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => {
          e.preventDefault();
          setZoomScale((prev) =>
             Math.min(Math.max(prev + (e.deltaY < 0 ? 0.2 : -0.2), 1), 3)
          );
          }}
          onMouseDown={(e) => {
          setDragging(true);
          setStart({ x: e.clientX - position.x, y: e.clientY - position.y });
          }}
          onMouseMove={(e) => {
          if (!dragging) return;
          setPosition({
          x: e.clientX - start.x,
          y: e.clientY - start.y
          });
         }}
         onMouseUp={() => setDragging(false)}
         onMouseLeave={() => setDragging(false)}
         />

         {/* Close button */}
         <button
         className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition-colors cursor-pointer"
         onClick={() => setIsZoomOpen(false)}
         >
         ✕
         </button>
        </div>
      )}
    </div>
  );
}