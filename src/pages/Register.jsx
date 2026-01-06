import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../services/authService";

/* Amazon-style animated input */
const inputStyle =
  "w-full mb-2 px-4 py-3 rounded-full border border-gray-300 outline-none " +
  "transition-all duration-300 " +
  "focus:border-indigo-500 " +
  "focus:ring-4 focus:ring-indigo-400/40 " +
  "hover:border-indigo-400";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pinNumber: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Email validation
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pinNumber.trim()) {
      newErrors.pinNumber = "Register number is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Student name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signUp({
        pinNumber: formData.pinNumber.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (result.success) {
        setSuccessMessage(
          "Account created successfully. Please verify your email."
        );

        setFormData({
          pinNumber: "",
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => navigate("/login"), 3000);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: err.message || "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
      <div className="w-[900px] max-w-[95%] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT SECTION */}
        <div className="md:w-1/2 p-10 text-white bg-gradient-to-br from-indigo-500 to-pink-400 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">Create your account</h1>
          <p className="text-sm opacity-90">
            Register to access nearby essential and emergency services.
          </p>
        </div>

        {/* RIGHT SECTION */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-2">
            Student Registration
          </h2>

          <p className="text-sm text-center mb-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
            <input
              name="pinNumber"
              placeholder="Register Number"
              value={formData.pinNumber}
              onChange={handleChange}
              className={inputStyle}
            />
            {errors.pinNumber && (
              <p className="text-red-600 text-sm mb-2">{errors.pinNumber}</p>
            )}

            <input
              name="name"
              placeholder="Student Name"
              value={formData.name}
              onChange={handleChange}
              className={inputStyle}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mb-2">{errors.name}</p>
            )}

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mb-2">{errors.email}</p>
            )}

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={inputStyle}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mb-2">{errors.password}</p>
            )}

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputStyle + " mb-4"}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mb-2">
                {errors.confirmPassword}
              </p>
            )}

            {successMessage && (
              <p className="text-green-600 text-sm mb-3">{successMessage}</p>
            )}

            {errors.submit && (
              <p className="text-red-600 text-sm mb-3">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-indigo-500 to-pink-400 hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "SIGN UP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
