import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Percent, TrendingDown, Sparkles, X, ArrowRight } from "lucide-react";
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
    <div className="sale-banner" onClick={handleClick}>
      <div className="sale-banner-content">
        <div className="sale-banner-icon">
          <Sparkles size={20} className="sale-banner-sparkle" />
          <TrendingDown size={24} />
        </div>

        <div className="sale-banner-text">
          <span className="sale-banner-title">Seasonal Edit</span>
          <span className="sale-banner-subtitle">
            Up to <strong>{maxDiscount}%</strong> off • {productsOnSale.length} items live
          </span>
        </div>

        <div className="sale-banner-metrics">
          <div className="sale-banner-metric">
            <span className="sale-banner-metric-label">Top Discount</span>
            <span className="sale-banner-metric-value">{maxDiscount}%</span>
          </div>
          <div className="sale-banner-metric">
            <span className="sale-banner-metric-label">On Sale</span>
            <span className="sale-banner-metric-value">{productsOnSale.length}</span>
          </div>
        </div>

        <div className="sale-banner-cta">
          <Percent size={18} />
          Shop Now
          <ArrowRight size={16} />
        </div>
      </div>

      <button
        className="sale-banner-close"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        aria-label="Close banner"
      >
        <X size={18} />
      </button>
    </div>
  );
}
