import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../redux/userSlicer";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import "./authentication.css";

const url = import.meta.env.VITE_BACKEND_URL;

const ChangePasswordForm = ({ updatePassword, userId, email }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
    apiError: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", apiError: "" }));
    setSuccessMessage("");
  };

  const handlePasswordUpdate = async () => {
    const { newPassword, confirmPassword } = formData;
    let validationErrors = {};

    if (newPassword.length < 6) {
      validationErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrors }));
      return;
    }

    if (!userId) {
      setErrors({
        ...errors,
        apiError: "User ID is missing. Cannot update password.",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${url}/user/api/v1/Password/${userId}`,
        {
          newPassword: formData.newPassword,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setSuccessMessage("Password updated successfully. Redirecting to login...");
        setFormData({ newPassword: "", confirmPassword: "" });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        apiError: error.response?.data?.message || "Failed to update password. Try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!updatePassword || !userId) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-md py-lg">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl p-lg sm:p-2xl border border-neutral-100 dark:border-neutral-700">
          <div className="text-center mb-2xl">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-lg">
              <Lock className="w-6 h-6 text-accent" strokeWidth={2} />
            </div>
            <h2 className="text-h2 font-heading font-semibold text-primary-dark dark:text-secondary-light">
              Change Password
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-md">
              Enter your new password below
            </p>
          </div>

          <div className="space-y-md">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-primary-dark dark:text-secondary-light mb-xs">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-md top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full pl-2xl pr-md py-2 bg-secondary-light dark:bg-neutral-700 text-primary-dark dark:text-secondary-light border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                />
              </div>
              {errors.newPassword && (
                <div className="flex items-start gap-xs mt-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-xs">{errors.newPassword}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-primary-dark dark:text-secondary-light mb-xs">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-md top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-2xl pr-md py-2 bg-secondary-light dark:bg-neutral-700 text-primary-dark dark:text-secondary-light border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition"
                />
              </div>
              {errors.confirmPassword && (
                <div className="flex items-start gap-xs mt-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-xs">{errors.confirmPassword}</p>
                </div>
              )}
            </div>

            {/* API Error */}
            {errors.apiError && (
              <div className="p-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-md">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-xs" strokeWidth={2} />
                <p className="text-sm text-red-700 dark:text-red-300">{errors.apiError}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg flex items-start gap-md">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-xs" strokeWidth={2} />
                <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handlePasswordUpdate}
              disabled={loading}
              className="w-full py-2 px-md bg-accent hover:bg-accent-dark disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 mt-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-md">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </div>

        {/* Security Tip */}
        <div className="mt-lg p-lg bg-white/10 dark:bg-neutral-800/50 rounded-lg border border-white/20 dark:border-neutral-700 backdrop-blur-sm">
          <p className="text-sm text-white dark:text-neutral-300 text-center">
            ✓ Use a strong password with mixed characters<br />
            ✓ At least 6 characters required<br />
            ✓ Your password is encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
