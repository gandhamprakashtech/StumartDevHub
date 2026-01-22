import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  signOut,
  onAuthStateChange,
} from "../../services/authService";

export default function Navbar() {
  const navigate = useNavigate();

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
      <nav className="w-full bg-blue-50 border-b border-blue-200 relative">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
            <img
              src="/StumartTransparent.png"
              alt="StuMart Logo"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 text-gray-600">
            <Link to="/" className="hover:text-black transition">
              Home
            </Link>
            <Link to="/customer-feedback" className="hover:text-black transition">
              Feedback
            </Link>

            {isLoading ? (
              <span className="text-sm">Loading...</span>
            ) : isAuthenticated ? (
              <>
                {/* Profile Avatar */}
                {student && (
                  <Link
                    to="/Profile"
                    title={student.name}
                    className="w-9 h-9 flex items-center justify-center rounded-full 
                               bg-blue-600 text-white font-semibold
                               hover:bg-blue-700 hover:ring-2 hover:ring-blue-300
                               transition"
                  >
                    {getInitials(student.name)}
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogoutClick}
                  className="hover:text-black transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-black transition">
                  Login
                </Link>
                <Link to="/register" className="hover:text-black transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Visible only on mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-black transition"
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

        {/* Mobile Menu - Slides down on mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-50 border-t border-blue-200">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="block py-2 text-gray-600 hover:text-black transition"
              >
                Home
              </Link>
              <Link
                to="/customer-feedback"
                onClick={closeMobileMenu}
                className="block py-2 text-gray-600 hover:text-black transition"
              >
                Customer Feedback
              </Link>

              {isLoading ? (
                <span className="block py-2 text-sm text-gray-600">Loading...</span>
              ) : isAuthenticated ? (
                <>
                  {student && (
                    <Link
                      to="/Profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-2 text-gray-600 hover:text-black transition"
                    >
                      <div className="w-9 h-9 flex items-center justify-center rounded-full 
                                     bg-blue-600 text-white font-semibold">
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
                    className="block w-full text-left py-2 text-gray-600 hover:text-black transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block py-2 text-gray-600 hover:text-black transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block py-2 text-gray-600 hover:text-black transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
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
