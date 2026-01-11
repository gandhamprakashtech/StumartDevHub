import React, { useState } from "react";
import { sendPasswordReset } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await sendPasswordReset(email.toLowerCase());
      setMessage(
        result.success
          ? "If an account exists, a reset link has been sent."
          : result.error
      );
    } catch {
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Reset your password</h2>

        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <button
          disabled={loading}
          className="cursor-pointer w-full bg-indigo-600 text-white py-2 rounded"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        {message && (
          <p className="mt-3 text-sm text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
  <script type="module" src="/auth.js"></script>

}
