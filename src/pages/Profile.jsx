import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { getCurrentUser } from "../services/authService";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(true);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user, student, error } = await getCurrentUser();
        if (error || !user || !student) {
          navigate("/login");
          return;
        }
        setUser(user);
        setStudent(student);

        const dismissed = localStorage.getItem("welcomeAlertDismissed");
        setShowWelcomeAlert(!dismissed);
      } catch {
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  const handleDismissWelcome = () => {
    setShowWelcomeAlert(false);
    localStorage.setItem("welcomeAlertDismissed", "true");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user || !student) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Student Profile</h1>
          <p className="opacity-90">Welcome back, {student.name}!</p>
        </div>

        {/* ===== STUDENT INFO ===== */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Student Information</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">PIN Number</p>
              <p className="font-medium">{student.pin_number}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{student.name}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-green-600">
                {student.email} ✓
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-green-600">Active</p>
            </div>

            <div className="bg-gray-50 p-4 rounded sm:col-span-2">
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="font-medium">
                {new Date(student.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* ===== BUTTONS ===== */}
        <div className="bg-white rounded-xl shadow p-6 flex gap-4">
          <Link
            to="/MyPosts"
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg text-center font-medium hover:bg-indigo-700"
          >
            📄 Your Posts
          </Link>

          {/* ✅ FIXED PATH */}
          <Link
            to="/liked-post"
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg text-center font-medium hover:bg-indigo-700"
          >
            ❤️ Liked Posts
          </Link>
        </div>

        {/* ===== WELCOME ALERT ===== */}
        {showWelcomeAlert && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-indigo-800">Account Active</p>
              <p className="text-sm text-indigo-700">
                Your account is active and verified.
              </p>
            </div>
            <button onClick={handleDismissWelcome} className="text-indigo-600">
              ✕
            </button>
          </div>
        )}

        {/* ===== NO ACTIVITY SECTION ===== */}
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <div className="flex justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2a4 4 0 00-4-4H3m18 6v-2a4 4 0 00-4-4h-2M7 7a4 4 0 118 0M12 21v-6"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold">No activity yet</h3>
          <p className="text-sm text-gray-500 mt-1">
            Start by creating your first post to see activity here.
          </p>

          <button
            onClick={() => navigate("/create-post")}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            + Create Post
          </button>
        </div>

      </div>
    </div>
  );
}
