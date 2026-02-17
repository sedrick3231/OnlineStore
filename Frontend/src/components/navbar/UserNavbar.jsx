import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Menu, Dot, X, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout, updateUser } from "../../redux/userSlicer";

const url = import.meta.env.VITE_BACKEND_URL;

const Dropdown = lazy(() => import("../Profile/Dropdown"));

export default function UserNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOnHero, setIsOnHero] = useState(false);
  const menuRef = useRef(null);
  const headerRef = useRef(null);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Detect scroll and hero section position
  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector('.hero');
      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        // Check if header is still over the hero section
        const isOver = heroRect.top < 100; // Header is 72px, add some buffer
        setIsOnHero(!isOver);
      } else {
        setIsOnHero(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dispatch(updateUser());
  }, [isLoggedIn, dispatch]);

  const handleLogout = async () => {
    try {
      await fetch(`${url}/user/api/v1/logout`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (error) {
      // Keep logout resilient even if API fails.
    } finally {
      dispatch(logout());
      setMenuOpen(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", menuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [menuOpen]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/contact-us", label: "Contact Us" },
  ];

  return (
    <header ref={headerRef} className={`site-header ${isOnHero ? 'on-hero' : ''}`} style={{ height: "var(--header-height)" }}>
      <nav className="container site-nav">
        <Link to="/" className="brand">
          <img src="/Logo2.png" alt="LAMS" className="navbar-logo" />
          <span>LAMS</span>
        </Link>

        <div className="nav-links">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          {isLoggedIn && (
            <NavLink to="/cart" className="icon-btn cart-badge">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && <span className="count" style={{ width: '13px', height: '13px', backgroundColor: '#bc0000', borderRadius: '50%', display: 'block' }}></span>}
            </NavLink>
          )}

          {isLoggedIn ? (
            <Suspense fallback={null}>
              <Dropdown />
            </Suspense>
          ) : (
            <NavLink to="/login" className="btn btn-primary">
              Login
            </NavLink>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="icon-btn hamburger-menu"
            aria-label="Toggle Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu" role="dialog">
            <div className="mobile-drawer" ref={menuRef}>
              <div className="mobile-drawer-header">
                <div className="mobile-brand">
                  <div>
                    <div className="mobile-brand-title">LAMS</div>
                    <div className="mobile-brand-subtitle">Premium wear</div>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="mobile-close"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mobile-section-title">Browse</div>
              <nav className="mobile-link-list">
                {navLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} end={to === "/"} onClick={() => setMenuOpen(false)}>
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="mobile-section-title">Account</div>
              <div className="mobile-nav-secondary">
                {isLoggedIn ? (
                  <>
                    <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
                      Go to cart
                    </NavLink>
                    <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
                  </>
                ) : (
                  <NavLink to="/login" onClick={() => setMenuOpen(false)} className="btn btn-primary">Login</NavLink>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
