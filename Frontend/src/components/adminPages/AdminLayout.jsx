import { useEffect, useState } from "react";
import {
  FiBarChart2,
  FiBox,
  FiMenu,
  FiSettings,
  FiShoppingCart,
  FiTag,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./admin.css";
import { logout } from "../../redux/userSlicer";

const sidebarLinks = [
  { name: "Users", to: "/admin/users", icon: <FiUsers size={20} /> },
  { name: "Orders", to: "/admin/orders", icon: <FiShoppingCart size={20} /> },
  { name: "Products", to: "/admin/products", icon: <FiBox size={20} /> },
  { name: "Categories", to: "/admin/categories", icon: <FiTag size={20} /> },
  { name: "Hero-Section", to: "/admin/hero-section", icon: <FiBarChart2 size={20} /> },
];


export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

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
      setSidebarOpen(false);
      navigate("/");
    }
  };

  return (
    <div className="admin-layout">
      {/* <AdminNavbar user={user} /> */}

      <div className="admin-container">
        {/* Mobile Header */}
        <div className="admin-mobile-header">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-mobile-toggle"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <div className="admin-mobile-title">
            <span className="admin-mobile-title-text">Admin Panel</span>
            <span className="admin-mobile-title-sub">Manage your store</span>
          </div>
          <div className="admin-mobile-avatar">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {
            sidebarOpen ? null : <div className="admin-sidebar-header">
              <h2 className="admin-sidebar-title">Admin Panel</h2>
              <p className="admin-sidebar-subtitle">Manage your store</p>
            </div>

          }
          <nav className="admin-nav">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="admin-nav-icon">{link.icon}</span>
                <span className="admin-nav-text">{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Admin Info */}
          <div className="admin-sidebar-footer">
            <div className="admin-user-info">
              <div className="admin-user-avatar">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="admin-user-details">
                <p className="admin-user-name">{user?.name || 'Admin'}</p>
                <p className="admin-user-role">Administrator</p>
                <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="admin-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}



        {/* Main Content */}
        <main className="admin-main" onClick={() => sidebarOpen && setSidebarOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
