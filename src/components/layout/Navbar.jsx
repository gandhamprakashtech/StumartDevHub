import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut, onAuthStateChange } from "../../services/authService";

export default function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setStudent(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
                onClick={handleLogout}
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
    </nav>
  );
}
