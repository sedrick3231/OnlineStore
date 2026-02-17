import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import "./notFound.css";

export default function NotFound() {
  return (
    <div style={{ paddingTop: 'var(--header-height)' }}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-md">
      <div className="text-center">
        {/* 404 */}
        <div className="mb-lg">
          <h1 className="text-9xl sm:text-[140px] font-heading font-bold text-white/10 leading-none">404</h1>
          <div className="relative -mt-16 sm:-mt-20">
            <p className="text-4xl sm:text-5xl font-heading font-semibold text-accent">Page Not Found</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-neutral-300 text-lg max-w-md mx-auto mb-2xl">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-md px-2xl py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-all duration-200"
          >
            <Home className="w-5 h-5" strokeWidth={2} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-md px-2xl py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 border border-white/20"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            Go Back
          </button>
        </div>

        {/* Bottom Help Text */}
        <div className="mt-3xl pt-3xl border-t border-white/10">
          <p className="text-white/60 text-sm mb-md">Need help?</p>
          <Link
            to="/contact-us"
            className="text-accent hover:text-white transition-colors font-medium underline"
          >
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
