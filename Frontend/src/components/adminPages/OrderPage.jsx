import { Calendar, DollarSign, Filter, Package, Search, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./admin.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleViewOrder = (order) => {
    navigate(`/admin/order/${order._id}`, { state: { order } });
  };

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/admin/api/v1/getOrders`, {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        setOrders(result.Orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  const GetDate = (registrationDate) => {
    const date = new Date(registrationDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredOrders = (orders || []).filter((order) => {
    const orderDate = new Date(order.date);
    const start = startDate
      ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
      : null;
    const end = endDate
      ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
      : null;
    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesStart = !start || orderDate >= start;
    const matchesEnd = !end || orderDate <= end;
    const matchesSearch =
      searchTerm === "" ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesStart && matchesEnd && matchesSearch;
  });

  // Calculate stats (excluding cancelled orders)
  const deliveredOrders = orders.filter(order => order.status === "Delivered").length;
  const totalRevenue = orders.filter(order => order.status !== "Cancelled").reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(order => order.status === "Pending").length;
  const validOrders = orders.filter(order => order.status !== "Cancelled").length;
  const avgOrderValue = validOrders > 0 ? (totalRevenue / validOrders) : 0;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">Track and manage customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <Package size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Orders</p>
            <p className="admin-stat-value">{orders.length}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <DollarSign size={24} style={{ color: '#22c55e' }} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Total Revenue</p>
            <p className="admin-stat-value">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
            <TrendingUp size={24} style={{ color: '#f97316' }} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Avg Order Value</p>
            <p className="admin-stat-value">${avgOrderValue.toFixed(2)}</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
            <Calendar size={24} style={{ color: '#eab308' }} />
          </div>
          <div className="admin-stat-content">
            <p className="admin-stat-label">Pending</p>
            <p className="admin-stat-value">{pendingOrders}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters-row">
        <div className="admin-search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <Search size={20} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-group">
          <div className="admin-filter-item">
            <label className="admin-filter-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-filter-input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="admin-filter-item">
            <label className="admin-filter-label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="admin-filter-input"
            />
          </div>

          <div className="admin-filter-item">
            <label className="admin-filter-label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="admin-filter-input"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td data-label="Order ID" className="admin-table-order-id">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td data-label="Customer" className="admin-user-name">{order.userId.name}</td>
                  <td data-label="Email" className="admin-table-email">{order.userId.email}</td>
                  <td data-label="Total" className="admin-table-price">${order.totalAmount.toFixed(2)}</td>
                  <td data-label="Status">
                    <span className={`admin-status-badge admin-status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Date" className="admin-table-date">{GetDate(order.date)}</td>
                  <td data-label="Actions">
                    <button
                      className="admin-action-btn"
                      onClick={() => handleViewOrder(order)}
                      aria-label="View order details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="admin-table-empty">
                    {searchTerm || statusFilter !== "all" || startDate || endDate
                      ? "No orders match the selected filters."
                      : "No orders found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
