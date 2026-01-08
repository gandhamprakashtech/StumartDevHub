import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut, onAuthStateChange } from "../../services/authService";

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
        const { user, student: studentData, error } = await getCurrentUser();
        if (user && studentData && !error) {
          setIsAuthenticated(true);
          setStudent(studentData);
        } else {
          setIsAuthenticated(false);
          setStudent(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setStudent(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        setStudent(null);
      } else if (event === 'SIGNED_IN' && session) {
        checkAuth();
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowConfirmModal(false);
    }
  };

  const cancelLogout = () => {
    setShowConfirmModal(false);
  };

  return (
    <nav className="w-full bg-blue-50 text-lg border-b py-1 border-blue-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/StumartTransparent.png" 
            alt="StuMart Logo" 
            className="h-16 w-auto"
          />
        </Link>

        <div className="flex gap-6 text-gray-600 items-center">
          <Link to="/" className="hover:text-black">
            Home
          </Link>
          {isLoading ? (
            <span className="text-sm">Loading...</span>
          ) : isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-black">
                Dashboard
              </Link>
              {student && (
                <span className="text-sm text-gray-500">
                  {student.name}
                </span>
              )}
              <button
                onClick={handleLogoutClick}
                className="hover:text-black cursor-pointer"
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute left-0 top-0 bg-black w-screen h-screen z-[-10] opacity-50"></div>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
