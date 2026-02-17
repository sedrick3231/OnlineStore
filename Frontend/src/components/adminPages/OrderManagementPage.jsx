import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { X, Package, User, MapPin, Calendar, AlertCircle, CheckCircle, Truck, ArrowLeft } from "lucide-react";
import "./admin.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function OrderManagementPage({ orders = [], users = [], onStatusChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const products = useSelector((state) => state.products?.items || []);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Find order from location state or props
  useEffect(() => {
    const orderFromState = location.state?.order;
    if (orderFromState) {
      setSelectedOrder(orderFromState);
    } else if (orderId && orders.length > 0) {
      const found = orders.find(o => o._id === orderId);
      setSelectedOrder(found);
    }
  }, [orderId, orders, location.state]);

  const GetDate = (registrationDate) => {
    const date = new Date(registrationDate);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };
  const getCustomerName = (order) => {
    if (order?.userId?.name) return order.userId.name;
    if (typeof order?.userId === "string") {
      return users.find((u) => u._id === order.userId)?.name || "Unknown";
    }
    return "Unknown";
  };

  const getCustomerEmail = (order) => {
    if (order?.userId?.email) return order.userId.email;
    if (typeof order?.userId === "string") {
      return users.find((u) => u._id === order.userId)?.email || "Unknown";
    }
    return "Unknown";
  };

  const normalizedItems = useMemo(() => {
    const lineItems = Array.isArray(selectedOrder?.products)
      ? selectedOrder.products
      : Array.isArray(selectedOrder?.items)
        ? selectedOrder.items
        : [];

    return lineItems.map((item) => {
      const productId = item.productId || item._id || item.id;
      const product = products.find((p) => p._id === productId);
      return {
        key: item._id || productId,
        name: product?.name || item.name || "Product",
        quantity: item.quantity || item.qty || 0,
        price: product?.price ?? item.price ?? 0,
      };
    });
  }, [selectedOrder, products]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "#f59e0b";
      case "Shipped": return "#1a5f5a";
      case "Delivered": return "#10b981";
      case "Cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <AlertCircle size={16} />;
      case "Shipped": return <Truck size={16} />;
      case "Delivered": return <CheckCircle size={16} />;
      case "Cancelled": return <X size={16} />;
      default: return <Package size={16} />;
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === selectedOrder.status) {
      toast.info("No changes made");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${url}/admin/api/v1/updateOrderStatus/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      onStatusChange?.(newStatus, selectedOrder._id);
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      toast.success("Order status updated successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.message || "Failed to update status");
      toast.error(err.message || "Failed to update status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedOrder) {
    return (
      <div className="order-management-page">
        <div className="order-page-header-bar">
          <button onClick={() => navigate(-1)} className="order-page-back-btn">
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
        <div className="order-page-container">
          <div className="order-not-found">
            <AlertCircle size={48} />
            <p>Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management-page">
      {/* Header */}
      <div className="order-page-header-bar">
        <button onClick={() => navigate(-1)} className="order-page-back-btn">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="order-page-header-content">
          <h1 className="order-page-title">Order Details</h1>
          <p className="order-page-subtitle">Order ID: {selectedOrder._id?.slice(-8) || "N/A"}</p>
        </div>
        <div className={`order-page-status-badge ${selectedOrder.status?.toLowerCase() || ""}`}>
          {getStatusIcon(selectedOrder.status)}
          <span>{selectedOrder.status}</span>
        </div>
      </div>
      <div className="order-page-container">
        <div className="order-page-grid">
          <div className="order-info-section">
            <h3>
              <User size={18} />
              Customer Information
            </h3>
            <div className="order-customer-info">
              <div className="order-info-item">
                <span className="order-info-label">Full Name</span>
                <span className="order-info-value">{getCustomerName(selectedOrder)}</span>
              </div>
              <div className="order-info-item">
                <span className="order-info-label">Email Address</span>
                <span className="order-info-value">{getCustomerEmail(selectedOrder)}</span>
              </div>
              <div className="order-info-item">
                <span className="order-info-label">Phone Number</span>
                <span className="order-info-value">{selectedOrder.address?.phone || "N/A"}</span>
              </div>
            </div>

            <div className="order-address-card">
              <h4>Delivery Address</h4>
              <p className="order-address-line">{selectedOrder.address?.address}</p>
              <p className="order-address-line">{selectedOrder.address?.city}, {selectedOrder.address?.state}</p>
              <p className="order-address-line">Postal Code: {selectedOrder.address?.postalCode}</p>
            </div>

            <div className="order-items-card">
              <h4>Order Items</h4>
              <div className="order-items-list">
                {normalizedItems.length > 0 ? (
                  normalizedItems.map((item) => (
                    <div key={item.key} className="order-item">
                      <div className="order-item-info">
                        <div className="order-item-name">{item.name}</div>
                        <div className="order-item-qty">Qty: {item.quantity}</div>
                      </div>
                      <div className="order-item-price">PKR {(item.price * item.quantity)?.toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="order-empty-state">No items in this order</div>
                )}
              </div>
            </div>
          </div>

          <div className="order-summary-section">
            <div className="order-summary-card">
              <div className="order-summary-row">
                <span className="order-summary-label">Subtotal</span>
                <span className="order-summary-value">PKR {selectedOrder.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="order-summary-row">
                <span className="order-summary-label">Tax</span>
                <span className="order-summary-value">PKR 0</span>
              </div>
              <div className="order-summary-row">
                <span className="order-summary-label">Shipping</span>
                <span className="order-summary-value">Free</span>
              </div>
              <div className="order-summary-row">
                <span className="order-summary-label">Total</span>
                <span className="order-summary-value order-summary-total">PKR {selectedOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="order-timeline-card">
              <h3>
                <Calendar size={18} />
                Order Information
              </h3>
              <div className="order-timeline">
                <div className="order-timeline-item active">
                  <div className="order-timeline-dot"></div>
                  <div className="order-timeline-content">
                    <div className="order-timeline-label">Order Placed</div>
                    <div className="order-timeline-date">{GetDate(selectedOrder.date)}</div>
                  </div>
                </div>
                {selectedOrder.status !== "Pending" && (
                  <div className="order-timeline-item active">
                    <div className="order-timeline-dot"></div>
                    <div className="order-timeline-content">
                      <div className="order-timeline-label">{selectedOrder.status}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="order-status-update">
              <h3>
                <Truck size={18} />
                Update Order Status
              </h3>
              <div className="order-status-buttons">
                {["Pending", "Shipped", "Delivered", "Cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`order-status-btn ${status.toLowerCase()} ${selectedOrder.status === status ? "active" : ""}`}
                    disabled={loading}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
