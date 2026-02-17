import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OTP from "../components/OTP/OTP";
import { Mail, Lock, User, AlertCircle, ArrowRight, Shield, CheckCircle } from "lucide-react";
import "./authentication.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [enterotp, setenterotp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${url}/user/api/v1/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        setenterotp(true);
      } else {
        setError(res.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (enterotp) {
    return (
      <div className="auth-page auth-page--signup">
        <div className="auth-bg">
          <span className="auth-glow auth-glow--one" />
          <span className="auth-glow auth-glow--two" />
          <span className="auth-grid" />
        </div>
        <div className="auth-shell auth-shell--single">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Verify your email</h2>
              <p className="auth-card-subtitle">Enter the OTP to finish creating your account.</p>
            </div>
            <OTP email={formData.email} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page auth-page--signup">
      <div className="auth-bg">
        <span className="auth-glow auth-glow--one" />
        <span className="auth-glow auth-glow--two" />
        <span className="auth-grid" />
      </div>

      <div className="auth-shell">
        <div className="auth-hero">
          <div>
            <div className="auth-badge">Join LAMS</div>
            <h1>Create your account</h1>
            <p>Save favorites, manage orders, and enjoy a smoother checkout.</p>
          </div>
          <ul className="auth-highlights">
            <li>
              <CheckCircle size={18} />
              <span>Track orders from your dashboard</span>
            </li>
            <li>
              <Shield size={18} />
              <span>Secure profile settings and updates</span>
            </li>
          </ul>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Sign up</h2>
            <p className="auth-card-subtitle">Join the store and start shopping today.</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span className="error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <div className="input-wrapper with-icon">
                <User size={18} />
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email Address</label>
              <div className="input-wrapper with-icon">
                <Mail size={18} />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="input-wrapper with-icon">
                <Lock size={18} />
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="auth-input"
                />
              </div>
              <span className="auth-hint">At least 6 characters required.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
              <div className="input-wrapper with-icon">
                <Lock size={18} />
                <input
                  id="signup-confirm"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <span className="auth-submit-loading">
                  <span className="auth-spinner" />
                  Creating account...
                </span>
              ) : (
                <span className="auth-submit-content">
                  Create account
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <div className="auth-footer-note">
            <span>Return to</span>
            <Link className="auth-link" to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
