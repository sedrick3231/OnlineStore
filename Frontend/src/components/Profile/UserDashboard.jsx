import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOrder } from "../../redux/OrderSlicer";
import { updateUserThunk } from "../../redux/userSlicer";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/GetCroppedImg";
import "./dashboard.css";


export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  
  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true }); // safer navigation
    }
    dispatch(getOrder({}));
  }, [user, navigate]);

  if (!user) return null;
  
  const [reviewImage, setReviewImage] = useState(user?.image.url);
  const orders = useSelector((state) => state.order.orders);
  const totalSpent = orders.filter(order => order.status !== "Cancelled").reduce((sum, order) => sum + order.totalAmount, 0);
  const [save, setSave] = useState(true);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState({
    userId: user?._id || "",
    name: user?.name || "",
    email: user?.email || "",
    image: user?.image.url || "",
  });
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSave(false);
    const formData = new FormData();
    formData.append("userId", form.userId);
    formData.append("name", form.name);
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    const result = await dispatch(updateUserThunk(formData)).unwrap();
    if (result) {
      setSave(true);
      setEditModalOpen(false);
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);
  
  const handleCropConfirm = async () => {
    const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
    const preview = URL.createObjectURL(croppedFile);
    setForm((prev) => ({ ...prev, image: croppedFile }));
    setReviewImage(preview);
    setImageSrc(null); // close crop overlay
  };
  return (
    <div className="dashboard-container">
      {/* Profile Header Card */}
      <div className="profile-card">
        <div className="profile-card-content">
          <img src={user?.image.url} alt="Profile" className="profile-avatar" loading="lazy" />
          <div className="profile-info">
            <h2 className="profile-name">{user?.name || "User"}</h2>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-member">
              Member since {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button onClick={() => setEditModalOpen(true)} className="btn-primary">
          Edit Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon="📦"
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          icon="💰"
        />
        <StatCard
          title="Delivered"
          value={orders.filter((o) => o.status === "Delivered").length}
          icon="✅"
        />
      </div>

      {/* Order History Table */}
      <div className="dashboard-card">
        <h3 className="dashboard-section-title">Order History</h3>
        {orders.length === 0 ? (
          <p className="empty-state">No orders yet. Start shopping to create your first order!</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead className="table-header">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="table-row">
                    <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td className="order-amount">${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge badge-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="admin-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="modal-close"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Name Field */}
              <div className="modal-form-group">
                <label className="modal-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="modal-input"
                />
              </div>

              {/* Email Field */}
              <div className="modal-form-group">
                <label className="modal-label">Email (Cannot change)</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="modal-input"
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              {/* Image Upload */}
              <div className="modal-form-group">
                <label className="modal-label">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImageSrc(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="modal-input"
                />
              </div>

              {/* Image Preview */}
              {reviewImage && (
                <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
                  <img
                    src={reviewImage}
                    alt="Preview"
                    className="profile-avatar"
                    style={{ width: "100px", height: "100px" }}
                  />
                </div>
              )}

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!save}
                  className="btn-primary"
                  style={{ opacity: save ? 1 : 0.6 }}
                >
                  {save ? "Save Changes" : "Saving..."}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {imageSrc && (
        <div className="admin-modal">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Crop Profile Image</h3>
              <button
                onClick={() => setImageSrc(null)}
                className="modal-close"
              >
                ✕
              </button>
            </div>

            <div style={{ position: "relative", width: "100%", height: "320px", background: "#000", borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--primary)" }}>
                Zoom Level
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setImageSrc(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="btn-primary"
              >
                Confirm Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-value">{value}</p>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
}
