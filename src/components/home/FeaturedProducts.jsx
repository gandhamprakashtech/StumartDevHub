import { Link, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { getProducts } from "../../services/productService";
import FeaturedProduct from "./FeaturedProduct";
const CARD_WIDTH = 324; // 300px card + 24px margin (mx-3)

export default function FeaturedProducts({ setShowScrollIndicator }) {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isSnapping, setIsSnapping] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const n = featuredProducts.length;
  const extendedProducts =
    n > 0
      ? [
          featuredProducts[n - 1],
          ...featuredProducts,
          featuredProducts[0],
          ...featuredProducts,
        ]
      : [];

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

  useEffect(() => {
    if (n === 0 || isHovering) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, n + 1));
    }, 2800);

    return () => clearInterval(interval);
  }, [n, isHovering]);

  useEffect(() => {
    const updateScrollIndicator = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const isAtBottom = scrollPosition >= pageHeight - 8;
      setShowScrollIndicator(!isAtBottom);
    };

    updateScrollIndicator();
    window.addEventListener("scroll", updateScrollIndicator, { passive: true });
    window.addEventListener("resize", updateScrollIndicator);

    return () => {
      window.removeEventListener("scroll", updateScrollIndicator);
      window.removeEventListener("resize", updateScrollIndicator);
    };
  }, []);

  // After sliding to a clone, snap to the real position without animation (seamless loop)
  const handleCarouselTransitionEnd = () => {
    if (n === 0) return;
    if (currentIndex === n + 1) {
      setIsSnapping(true);
      requestAnimationFrame(() => {
        setCurrentIndex(1);
        requestAnimationFrame(() => setIsSnapping(false));
      });
    } else if (currentIndex === 0) {
      setIsSnapping(true);
      requestAnimationFrame(() => {
        setCurrentIndex(n);
        requestAnimationFrame(() => setIsSnapping(false));
      });
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;

    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) {
      setCurrentIndex((prev) => prev + 1);
    }
    if (distance < -50) {
      setCurrentIndex((prev) => prev - 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  

  return (
    <>
      {featuredProducts.length > 0 && (
        <section
          id="featured-products"
          className="max-w-6xl mx-auto px-4 py-8 md:py-12 lg:py-16"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 transition-colors"
            >
              View All
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="relative overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Previous Button */}
              <button
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
                aria-label="Previous product"
              >
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * CARD_WIDTH}px)`,
                  transition: isSnapping ? "none" : undefined,
                }}
                onTransitionEnd={handleCarouselTransitionEnd}
              >
                {extendedProducts.map((product, index) => (
                  <FeaturedProduct
                    product={product}
                    index={index}
                    currentIndex={currentIndex}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
                aria-label="Next product"
              >
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
