import { Link, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  signOut,
  onAuthStateChange,
} from "../../services/authService";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, student: studentData, error } =
          await getCurrentUser();

        if (user && studentData && !error) {
          setIsAuthenticated(true);
          setStudent(studentData);
        } else {
          setIsAuthenticated(false);
          setStudent(null);
        }
      } catch {
        setIsAuthenticated(false);
        setStudent(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const unsubscribe = onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false);
        setStudent(null);
      }
      if (event === "SIGNED_IN" && session) {
        checkAuth();
      }
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const handleLogoutClick = () => {
    setShowConfirmModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setIsAuthenticated(false);
      setStudent(null);
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setShowConfirmModal(false);
    }
  };

  const cancelLogout = () => {
    setShowConfirmModal(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Generate initials like "KS"
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <>
      {/* Navbar */}
      <nav className="w-full bg-gradient-to-r from-blue-700 via-purple-600 to-purple-700 relative">
        <div className="max-w-6xl mx-auto px-4 min-h-[4rem] sm:min-h-[4.5rem] flex items-center justify-between">
          
          {/* Logo and College Name */}
          <Link
            to="/"
            className="flex items-center gap-3 sm:gap-4 flex-shrink-0"
            onClick={closeMobileMenu}
          >
            <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20">
              <img
                src="/newlogotransparent.png"
                alt="AANM & VVRSR StuMart Logo"
                className="h-full w-full object-contain"
                width={64}
                height={64}
                decoding="async"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-tight whitespace-nowrap tracking-wide drop-shadow-sm">
                AANM & VVRSR
              </span>
              <span className="text-xs sm:text-sm md:text-base text-blue-100 leading-tight whitespace-nowrap uppercase tracking-widest">
                Polytechnic
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center justify-center gap-4 lg:gap-6 text-blue-100 flex-1">
            <Link
              to="/"
              className={`relative px-2 py-1 transition ${
                isActive("/")
                  ? "text-white after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-1 after:w-6 after:rounded-full after:bg-indigo-300"
                  : "hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/contact"
              className={`relative px-2 py-1 transition ${
                isActive("/contact")
                  ? "text-white after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-1 after:w-6 after:rounded-full after:bg-indigo-300"
                  : "hover:text-white"
              }`}
            >
              Contact Us
            </Link>
            <Link
              to="/about"
              className={`relative px-2 py-1 transition ${
                isActive("/about")
                  ? "text-white after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-1 after:w-6 after:rounded-full after:bg-indigo-300"
                  : "hover:text-white"
              }`}
            >
              About Us
            </Link>
            <Link
              to="/customer-feedback"
              className={`relative px-2 py-1 transition ${
                isActive("/customer-feedback")
                  ? "text-white after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-1 after:w-6 after:rounded-full after:bg-indigo-300"
                  : "hover:text-white"
              }`}
            >
              Feedback
            </Link>
          </div>

          {/* Right side - Auth/Profile */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <span className="text-sm text-blue-100">Loading...</span>
            ) : isAuthenticated ? (
              <>
                {/* Profile Avatar */}
                {student && (
                  <Link
                    to="/Profile"
                    title={student.name}
                    className="w-9 h-9 flex items-center justify-center rounded-full 
                               bg-white text-blue-700 font-semibold
                               hover:bg-blue-50 hover:ring-2 hover:ring-blue-200
                               transition"
                  >
                    {getInitials(student.name)}
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogoutClick}
                  className="hover:text-white text-indigo-100  cursor-pointer transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 text-blue-100">
                <Link
                  to="/login"
                  className="hover:text-white transition"
                >
                  Login
                </Link>
                <div className="h-6 w-px bg-blue-200/50"></div>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-full border border-white/60 text-white hover:bg-white/15 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Visible only on mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-blue-100 hover:text-white transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay - Click outside to close */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu - Sidebar drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-blue-700 via-purple-600 to-purple-700 p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full shadow-sm ring-2 ring-white/40 h-16 w-16 overflow-hidden bg-transparent">
                <img
                  src="/newlogotransparent.png"
                  alt="StuMart Logo"
                  className="h-full w-full object-cover scale-105"
                  width={56}
                  height={56}
                  decoding="async"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-white leading-tight tracking-wide">
                  AANM & VVRSR
                </span>
                <span className="text-xs text-blue-100 leading-tight uppercase tracking-widest">
                  Polytechnic
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-6 py-6 space-y-1 text-gray-700">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`block py-3 px-3 rounded-lg transition ${
                isActive("/")
                  ? "bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600"
                  : "hover:bg-gray-50"
              }`}
            >
              Home
            </Link>
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className={`block py-3 px-3 rounded-lg transition ${
                isActive("/contact")
                  ? "bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600"
                  : "hover:bg-gray-50"
              }`}
            >
              Contact Us
            </Link>
            <Link
              to="/about"
              onClick={closeMobileMenu}
              className={`block py-3 px-3 rounded-lg transition ${
                isActive("/about")
                  ? "bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600"
                  : "hover:bg-gray-50"
              }`}
            >
              About Us
            </Link>
            <Link
              to="/customer-feedback"
              onClick={closeMobileMenu}
              className={`block py-3 px-3 rounded-lg transition ${
                isActive("/customer-feedback")
                  ? "bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600"
                  : "hover:bg-gray-50"
              }`}
            >
              Customer Feedback
            </Link>

            {isLoading ? (
              <span className="block py-3 px-3 text-sm text-gray-500">Loading...</span>
            ) : isAuthenticated ? (
              <>
                {student && (
                  <Link
                    to="/Profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-3 px-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-full 
                                   bg-indigo-600 text-white font-semibold">
                      {getInitials(student.name)}
                    </div>
                    <span>Profile</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogoutClick();
                  }}
                  className="block w-full text-left py-3 px-3 hover:bg-gray-50 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 space-y-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 text-center border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50"></div>

          <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-blue-600 text-white rounded-md
                           hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
