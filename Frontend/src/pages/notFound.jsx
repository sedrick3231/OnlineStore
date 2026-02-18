import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import "./notFound.css";

export default function NotFound() {
  return (
    <div className="not-found-container">
      {/* Animated Background Blobs */}
      <div className="not-found-blob-1"></div>
      <div className="not-found-blob-2"></div>

      <div className="not-found-content">
        {/* 404 Code */}
        <div className="not-found-code">404</div>
        
        {/* Title */}
        <h1 className="not-found-title">Page Not Found</h1>
        <div className="not-found-divider"></div>

        {/* Description */}
        <p className="not-found-description">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <Link to="/" className="btn-home">
            <Home size={18} strokeWidth={2} />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-back">
            <ArrowLeft size={18} strokeWidth={2} />
            Go Back
          </button>
        </div>

        {/* Bottom Help Text */}
        <div className="not-found-help">
          <p className="not-found-help-text">Need help?</p>
          <Link to="/contact-us" className="not-found-help-link">
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  );
}
