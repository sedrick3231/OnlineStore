import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "./home.css";

export default function PromoBanner() {
  return (
    <section className="home-section">
      <div className="container">
        <div className="promo-banner">
          <div className="section-eyebrow" style={{ color: "rgba(255,255,255,0.75)" }}>
            <Sparkles size={18} />
            Limited Time
          </div>
          <h2 className="section-title" style={{ color: "#fff" }}>Limited Time Offer</h2>
          <p className="section-subtitle" style={{ color: "rgba(255,255,255,0.8)" }}>
            Get <strong>20% off</strong> your first order. Use code <strong>WELCOME20</strong> at checkout.
          </p>
          <div className="promo-actions">
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            <Link to="/shop?featured=true" className="btn btn-ghost">View Featured</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
