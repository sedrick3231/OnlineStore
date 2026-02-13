import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
  const categories = useSelector((state) => state.categories.items);
  const topCategories = Array.isArray(categories) ? categories.slice(0, 6) : [];
  const hasCategories = topCategories.length > 0;

  const buildCategoryUrl = (name) => {
    const params = new URLSearchParams();
    if (name) {
      params.set("category", name);
    }
    return `/shop?${params.toString()}`;
  };

  const quickLinks = [
    { label: "Shop", to: "/shop" },
    { label: "Cart", to: "/cart" },
    { label: "Contact Us", to: "/contact-us" },
  ];

  const accountLinks = [
    { label: "Login", to: "/login" },
    { label: "Sign Up", to: "/signup" },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">Solvia</div>
            <p className="footer-description">
              Curated designer wear and modern traditional fashion, thoughtfully made for everyday elegance.
            </p>
          </div>

          {hasCategories && (
            <div className="footer-section">
              <h4>Categories</h4>
              <ul>
                {topCategories.map((category) => (
                  <li key={category.id || category.name}>
                    <Link to={buildCategoryUrl(category.name)}>{category.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Account</h4>
            <ul>
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-legal">
          <p style={{ color: "white" }}>© {new Date().getFullYear()} Solvia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
