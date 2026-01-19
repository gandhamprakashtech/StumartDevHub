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
      <nav className="w-full bg-blue-50 border-b border-blue-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/StumartTransparent.png"
              alt="StuMart Logo"
              className="h-12 w-auto"
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4 text-gray-600">
            <Link to="/" className="hover:text-black">
              Home
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
                  className="hover:text-black"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-black">
                  Login
                </Link>
                <Link to="/register" className="hover:text-black">
                  Register
                </Link>
              </>
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
