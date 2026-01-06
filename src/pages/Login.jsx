import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, resendVerificationEmail } from "../services/authService";

/* Amazon-style animated input */
const inputStyle =
  "w-full mb-2 px-4 py-3 rounded-full border border-gray-300 outline-none " +
  "transition-all duration-300 " +
  "focus:border-indigo-500 " +
  "focus:ring-4 focus:ring-indigo-400/40 " +
  "hover:border-indigo-400";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // email validation
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "email") {
      setShowResendEmail(false);
      setResendMessage("");
    }
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setShowResendEmail(false);

    if (!formData.email || !validateEmail(formData.email)) {
      return setErrors({ email: "Enter a valid email" });
    }
    if (!formData.password) {
      return setErrors({ password: "Password required" });
    }

    setIsLoading(true);

    try {
      const result = await signIn(
        formData.email.toLowerCase(),
        formData.password
      );

      if (result.success) {
        navigate("/dashboard");
      } else {
        if (result.error?.toLowerCase().includes("verify")) {
          setShowResendEmail(true);
        }
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  // resend verification
  const handleResendVerification = async () => {
    setResendLoading(true);
    const result = await resendVerificationEmail(formData.email);
    setResendMessage(
      result.success
        ? "Verification email sent!"
        : result.error || "Failed to resend"
    );
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
      <div className="w-[900px] max-w-[95%] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT */}
        <div className="md:w-1/2 p-10 text-white bg-gradient-to-br from-indigo-500 to-pink-400 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to Stumart</h1>
          <p className="text-sm opacity-90">
            Please login here.
          </p>
        </div>

        {/* RIGHT */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-6">
            User Login
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mb-2">{errors.email}</p>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={inputStyle}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mb-2">{errors.password}</p>
            )}

            {errors.submit && (
              <p className="text-red-600 text-sm mb-3">{errors.submit}</p>
            )}

            {showResendEmail && (
              <div className="bg-yellow-100 p-3 rounded mb-3 text-sm">
                Email not verified.
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="underline ml-2"
                >
                  {resendLoading ? "Sending..." : "Resend"}
                </button>
                {resendMessage && (
                  <p className="mt-1 text-green-700">{resendMessage}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 to-pink-400 disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "LOGIN"}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            New user?{" "}
            <Link to="/register" className="text-indigo-600 underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
