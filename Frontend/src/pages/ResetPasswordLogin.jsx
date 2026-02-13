import axios from "axios";
import { useState } from "react";
import OTP from "../components/OTP/OTP";
import "./authentication.css";

const url = import.meta.env.VITE_BACKEND_URL;

function ResetPasswordLogin() {
  const [otpRequired, setOtpRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(
        `${url}/user/api/v1/ResetPassword`,
        { email },
        { withCredentials: true }
      );
      if (res.data.success) {
        setOtpRequired(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (otpRequired) {
    return <OTP email={email} resetPassword={true} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff7ed_0%,#f4f4f5_38%,#ececec_100%)] dark:bg-[radial-gradient(circle_at_top,#1a1a1d_0%,#111113_60%,#0b0b0c_100%)] px-4">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-500/20" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-rose-200/60 blur-3xl dark:bg-amber-700/10" />

      <div className="relative flex min-h-screen items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl border border-amber-100/70 bg-white/90 p-6 shadow-[0_20px_60px_-25px_rgba(120,84,20,0.45)] backdrop-blur dark:border-[#2c2c2f] dark:bg-[#151518]/90 sm:p-8"
        >
          <div className="mb-6 text-center">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Account Recovery
            </span>
            <h2 className="mt-4 text-3xl font-serif font-bold text-amber-950 dark:text-amber-200">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              We will send a one-time code to verify your email.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div className="mt-2 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200 dark:border-[#3a3a3e] dark:bg-[#1f1f22] dark:focus-within:ring-amber-600/30">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Use the email linked to your account.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          {error && (
            <p className="mt-4 text-center text-sm font-semibold text-red-600 dark:text-red-400" aria-live="polite">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordLogin;
