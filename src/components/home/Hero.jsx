import { Link, useNavigate } from "react-router";

export default function Hero({ showScrollIndicator }) {
  return (
    <section className="w-full relative overflow-hidden min-h-auto md:min-h-[60vh] flex items-center">
      {/* Background image (static) */}
      <div
        className="absolute inset-0 z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-student-illustration.png.jpeg')",
          backgroundSize: "120%",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />

      {/* Soft white overlay for readability (40-50% opacity on mobile, 60-70% on desktop) */}
      <div
        className="absolute inset-0 bg-white/40 md:bg-white/70 z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative background elements (blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-30 max-w-6xl mx-auto px-4 py-10 sm:py-12 md:py-20 lg:py-28 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-extrabold text-gray-900 mb-1 sm:mb-3 md:mb-4 lg:mb-5 leading-tight animate-fade-in-up">
          <span className="block sm:inline">Welcome to</span>
        </h1>
        <div className="mb-3 sm:mb-6 md:mb-7 lg:mb-8 animate-fade-in-up-delay-1">
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[150px] font-cinzel font-bold block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient leading-none">
            <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[110px] xl:text-[180px]">
              S
            </span>
            tuMar
            <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[110px] xl:text-[180px]">
              t
            </span>
          </span>
        </div>
        <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold text-gray-900 max-w-3xl mx-auto mb-1 sm:mb-2 md:mb-3 lg:mb-4 leading-relaxed animate-fade-in-up-delay-2">
          Why to carry extra stuff when already carrying your emotional baggage?
          Sell your extra items now
        </p>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <button
            type="button"
            className="fixed left-1/2 bottom-6 -translate-x-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 shadow-md hover:shadow-lg hover:opacity-90 transition-all z-50"
            onClick={() => {
              window.scrollBy({
                top: window.innerHeight * 0.8,
                behavior: "smooth",
              });
            }}
            aria-label="Scroll down"
          >
            <div className="animate-bounce">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </button>
        )}

        <p className="text-xs sm:text-sm md:text-base lg:text-lg font-normal text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-10 animate-fade-in-up-delay-3">
          A trusted platform connecting students to exchange academic essentials
          safely within your college community.
        </p>
        <div className="flex justify-center items-center w-full sm:w-auto animate-fade-in-up-delay-4">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
}
