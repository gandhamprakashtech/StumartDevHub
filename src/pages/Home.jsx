import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const result = await getProducts({ limit: 6 });
        if (result.success) {
          setFeaturedProducts(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return "FREE";
    return `₹ ${numPrice.toFixed(2)}`;
  };

  const getFirstImage = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls[0];
    }
    return "https://via.placeholder.com/400x300?text=No+Image";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden min-h-screen flex items-center">
        {/* Background image (static) */}
        <div
          className="absolute inset-0 z-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/bg-student-illustration.png.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />

        {/* Soft white overlay for readability (60-70% opacity) */}
        <div className="absolute inset-0 bg-white/70 z-10 pointer-events-none" aria-hidden="true" />

        {/* Decorative background elements (blobs) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-30 max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 mb-2 sm:mb-4 md:mb-6 leading-tight">
            <span className="block sm:inline">Welcome to</span>
          </h1>
          <div className="mb-6 sm:mb-8 md:mb-10">
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient leading-none">
              StuMart
            </span>
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto mb-3 sm:mb-4 leading-relaxed">
            Why to carry extra stuff when already carrying your emotional baggage? Sell your extra items now
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10">
            A trusted platform connecting students to exchange academic essentials safely within your college community.
          </p>
          <div className="flex justify-center items-center w-full sm:w-auto">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 transition-colors"
            >
              View All
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    <img
                      src={getFirstImage(product.image_urls)}
                      alt={product.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {product.title}
                    </h3>
                    <p className={`text-xl font-bold ${parseFloat(product.price) === 0 ? "text-green-600" : "text-indigo-600"}`}>
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Statistics Section */}
      <section className="bg-white/50 backdrop-blur-sm py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Verified Students</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">₹0</div>
              <div className="text-gray-600 font-medium">Shipping Fees</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Campus Access</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Safe Exchange</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose StuMart Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
          Why Choose StuMart?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          A trusted platform that connects verified students within the campus.

        </p>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 text-center">
              Verified Student Network
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Only registered students with verified credentials can access the platform, ensuring a safe and trusted environment.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 text-center">
              Campus-Based Exchange
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              A simple, safe, and campus-focused platform designed exclusively for students.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 text-center">
              Affordable & Sustainable
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Save money by purchasing used items at great prices while promoting environmental sustainability.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
          How It Works
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
         Buy and sell academic essentials safely within your campus
        </p>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
          
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">Register & Login</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create your account using your student email and verify your credentials.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
           
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">Post or Browse</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              List items you want to sell with photos, or browse available products from other students.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
           
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">Contact Seller</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Reach out directly to sellers through the platform to ask questions and negotiate.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">

            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">Meet & Exchange</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Arrange a safe meeting on campus to complete the transaction in person.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}