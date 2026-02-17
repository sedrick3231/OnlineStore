import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Facebook, Instagram, Twitter, Linkedin, Mail } from "lucide-react";

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

  const socialLinks = [
    { label: "Facebook", url: "https://facebook.com/lamsstore", icon: Facebook },
    { label: "Instagram", url: "https://instagram.com/lamsstore", icon: Instagram },
    { label: "LinkedIn", url: "https://linkedin.com/company/lamsstore", icon: Linkedin },
    { label: "Email", url: "mailto:support@lams.com", icon: Mail },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/Logo2.png" alt="LAMS" className="footer-logo-img" />
            <p className="footer-brand-name">LAMS</p>
            <p className="footer-description">
              Premium fashion and accessories, thoughtfully curated for modern elegance and timeless style.
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
            <h4>Follow Us</h4>
            <div className="footer-social-links">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    title={item.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="footer-legal">
          <p style={{ color: "white" }}>© {new Date().getFullYear()} LAMS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
