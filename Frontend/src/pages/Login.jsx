import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import OTP from "../components/OTP/OTP";
import { loginUser } from "../redux/userSlicer";
import { selectAuthState, selectUserData } from "../redux/selectors";
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import "./authentication.css";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin } = useSelector(selectUserData);
  const { loading, error, otpRequired, emailForOTP } = useSelector(selectAuthState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");
    
    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required");
      return;
    }
    
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin");
    } else if (user && isLoggedIn) {
      navigate("/");
    }
  }, [user, isLoggedIn, isAdmin, navigate]);

  if (otpRequired && emailForOTP) {
    return (
      <div className="auth-page auth-page--login">
        <div className="auth-bg">
          <span className="auth-glow auth-glow--one" />
          <span className="auth-glow auth-glow--two" />
          <span className="auth-grid" />
        </div>
        <div className="auth-shell auth-shell--single">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Verify your email</h2>
              <p className="auth-card-subtitle">Enter the OTP to continue.</p>
            </div>
            <OTP email={emailForOTP} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-bg">
        <span className="auth-glow auth-glow--one" />
        <span className="auth-glow auth-glow--two" />
        <span className="auth-grid" />
      </div>

      <div className="auth-shell">
        <div className="auth-hero">
          <div>
            <div className="auth-badge">LAMS Studio</div>
            <h1>Welcome back</h1>
            <p>Access your saved styles, orders, and curated drops in seconds.</p>
          </div>
          <ul className="auth-highlights">
            <li>
              <Shield size={18} />
              <span>Secure sessions with protected checkout</span>
            </li>
            <li>
              <Mail size={18} />
              <span>Order updates delivered to your inbox</span>
            </li>
          </ul>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Sign in</h2>
            <p className="auth-card-subtitle">Use your email and password to continue.</p>
          </div>

          {(error || localError) && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span className="error-text">{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-wrapper with-icon">
                <Mail size={18} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="auth-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper with-icon with-trailing">
                <Lock size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="input-trailing"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-helper-row">
              <label className="auth-check">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link className="auth-link" to="/reset-login">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <span className="auth-submit-loading">
                  <span className="auth-spinner" />
                  Signing in...
                </span>
              ) : (
                <span className="auth-submit-content">
                  Sign In
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to LAMS?</span>
          </div>

          <div className="auth-footer-note">
            <span>Don't have an account?</span>
            <Link className="auth-link" to="/signup">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
