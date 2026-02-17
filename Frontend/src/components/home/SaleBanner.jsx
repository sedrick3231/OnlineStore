import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Percent, TrendingDown, Sparkles, X, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import "./home.css";

export default function SaleBanner() {
  const products = useSelector((state) => state.products.items);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  // Check if there are any products on sale
  const productsOnSale = products.filter(product => product.isOnSale);
  
  if (!isVisible || productsOnSale.length === 0) return null;

  const maxDiscount = Math.max(...productsOnSale.map(p => p.salePercentage || 0));

  const handleClick = () => {
    navigate("/shop?sale=true");
  };

  return (
    <div className="sale-banner">
      {/* Animated gradient background */}
      <div className="sale-banner-bg"></div>

      <div className="sale-banner-content">
        {/* Icon section with animation */}
        <div className="sale-banner-icon-wrapper">
          <div className="sale-banner-icon">
            <Zap size={22} className="sale-banner-zap" />
            <Sparkles size={18} className="sale-banner-sparkle" />
          </div>
          <div className="sale-banner-badge">HOT</div>
        </div>

        {/* Text section */}
        <div className="sale-banner-text">
          <div className="sale-banner-title">
            <span className="sale-banner-title-text">Seasonal Sale</span>
            <span className="sale-banner-title-accent">Now Live</span>
          </div>
          <p className="sale-banner-subtitle">
            Save up to <strong className="sale-banner-discount">{maxDiscount}%</strong> on {productsOnSale.length} curated items
          </p>
        </div>

        {/* Metrics section */}
        <div className="sale-banner-metrics">
          <div className="sale-banner-metric">
            <span className="sale-banner-metric-label">Max</span>
            <span className="sale-banner-metric-value">{maxDiscount}%</span>
          </div>
          <div className="sale-banner-divider"></div>
          <div className="sale-banner-metric">
            <span className="sale-banner-metric-label">Items</span>
            <span className="sale-banner-metric-value">{productsOnSale.length}</span>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          className="sale-banner-cta"
          onClick={handleClick}
          aria-label="Shop sale items"
        >
          <span>Shop Now</span>
          <ArrowRight size={16} className="sale-banner-arrow" />
        </button>
      </div>

      {/* Close button */}
      <button
        className="sale-banner-close"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        aria-label="Close banner"
        title="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
}
