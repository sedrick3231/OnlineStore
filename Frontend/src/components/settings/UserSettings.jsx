import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/userSlicer";
import "./settings.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function SettingsPage() {
  const { user } = useSelector((state) => state.user);
  const userId = user?._id;
  const [activeTab, setActiveTab] = useState("shipping");

  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      {/* Settings Tabs Navigation */}
      <nav className="settings-nav" aria-label="Settings Tabs">
        {["shipping", "security", "preferences"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              className={`settings-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab}-panel`}
              id={`${tab}-tab`}
              tabIndex={isActive ? 0 : -1}
            >
              {tab === "shipping" && "📍 Shipping Address"}
              {tab === "security" && "🔐 Security"}
              {tab === "preferences" && "⚙️ Preferences"}
            </button>
          );
        })}
      </nav>

      {/* Settings Content */}
      <section className="settings-content">
        {activeTab === "shipping" && (
          <ShippingAddressSection userId={userId} user={user} />
        )}
        {activeTab === "security" && (
          <SecuritySettingsSection userId={userId} />
        )}
        {activeTab === "preferences" && (
          <OrderPreferencesSection />
        )}
      </section>
    </div>
  );
}

// Shipping Address Settings
function ShippingAddressSection({ userId, user }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [address, setAddress] = useState({
    street: user?.ShippingAddress?.address || "",
    city: user?.ShippingAddress?.city || "",
    state: user?.ShippingAddress?.state || "",
    zip: user?.ShippingAddress?.postalCode || "",
    phone: user?.ShippingAddress?.phone || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const shippingAddress = {
        address: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.zip,
        phone: address.phone,
      };

      const res = await axios.post(
        `${url}/user/settings/updateAddress/${userId}`,
        { shippingAddress },
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(updateUser({ ShippingAddress: shippingAddress }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update address:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Default Shipping Address</h2>
      
      {saveSuccess && (
        <div className="settings-success">
          <span className="settings-success-text">
            Address updated successfully!
          </span>
        </div>
      )}

      {isEditing ? (
        <form className="settings-form">
          {/* Street */}
          <div className="settings-form-group form-row-settings full">
            <label className="settings-label">Street Address</label>
            <input
              type="text"
              name="street"
              value={address.street}
              onChange={handleChange}
              placeholder="123 Main Street"
              className="settings-input"
            />
          </div>

          {/* City, State, ZIP */}
          <div className="form-row-settings">
            <div className="settings-form-group">
              <label className="settings-label">City</label>
              <input
                type="text"
                name="city"
                value={address.city}
                onChange={handleChange}
                placeholder="New York"
                className="settings-input"
              />
            </div>
            <div className="settings-form-group">
              <label className="settings-label">State</label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleChange}
                placeholder="NY"
                className="settings-input"
              />
            </div>
          </div>

          {/* ZIP & Phone */}
          <div className="form-row-settings">
            <div className="settings-form-group">
              <label className="settings-label">ZIP Code</label>
              <input
                type="text"
                name="zip"
                value={address.zip}
                onChange={handleChange}
                placeholder="10001"
                className="settings-input"
              />
            </div>
            <div className="settings-form-group">
              <label className="settings-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={address.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="settings-input"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="button-group">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel-settings"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-save-settings"
            >
              Save Address
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="address-display">
            {address.street ? (
              <>
                <div className="address-line">
                  <span>Street:</span>
                  <span>{address.street}</span>
                </div>
                <div className="address-line">
                  <span>City:</span>
                  <span>{address.city}</span>
                </div>
                <div className="address-line">
                  <span>State:</span>
                  <span>{address.state}</span>
                </div>
                <div className="address-line">
                  <span>ZIP:</span>
                  <span>{address.zip}</span>
                </div>
                <div className="address-line">
                  <span>Phone:</span>
                  <span>{address.phone}</span>
                </div>
              </>
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
                No address saved yet. Add a default shipping address.
              </p>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-edit-settings"
          >
            {address.street ? "Edit Address" : "Add Address"}
          </button>
        </>
      )}
    </div>
  );
}

// Security Settings
function SecuritySettingsSection({ userId }) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "", apiError: "" });
  };

  const handlePasswordUpdate = async () => {
    const { oldPassword, newPassword, confirmPassword } = formData;
    let newErrors = {};

    if (!oldPassword) newErrors.oldPassword = "Current password is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    if (newPassword && newPassword.length <= 6) newErrors.newPassword = "Password must be longer than 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await axios.put(
        `${url}/user/api/v1/updatePassword/${userId}`,
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      if (res.data.success) {
        setSuccessMessage("Password updated successfully!");
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setErrors({
        apiError: error?.response?.data?.message || "Failed to update password",
      });
    }
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Change Password</h2>
      <p className="settings-section-description">
        Keep your account secure by using a strong, unique password.
      </p>

      {successMessage && (
        <div className="settings-success">
          <span className="settings-success-text">{successMessage}</span>
        </div>
      )}

      {errors.apiError && (
        <div style={{
          background: "rgba(192, 57, 43, 0.1)",
          border: "1.5px solid #c0392b",
          borderRadius: "14px",
          padding: "16px",
          color: "#c0392b",
          marginBottom: "24px",
          fontSize: "14px",
          fontWeight: 600,
        }}>
          {errors.apiError}
        </div>
      )}

      <form className="settings-form">
        {/* Current Password */}
        <div className="settings-form-group">
          <label className="settings-label">Current Password</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="Enter your current password"
            className="settings-input"
          />
          {errors.oldPassword && (
            <p style={{ color: "#c0392b", fontSize: "12px", marginTop: "6px" }}>
              {errors.oldPassword}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="settings-form-group">
          <label className="settings-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter your new password"
            className="settings-input"
          />
          {errors.newPassword && (
            <p style={{ color: "#c0392b", fontSize: "12px", marginTop: "6px" }}>
              {errors.newPassword}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="settings-form-group">
          <label className="settings-label">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            className="settings-input"
          />
          {errors.confirmPassword && (
            <p style={{ color: "#c0392b", fontSize: "12px", marginTop: "6px" }}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handlePasswordUpdate}
          className="btn-save-settings"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}

// Order Preferences
function OrderPreferencesSection() {
  const [formData, setFormData] = useState({
    deliverySlot: "morning",
    emailNotif: true,
    smsNotif: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    // TODO: Implement preferences save
    alert("This feature is not implemented yet.");
  };

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Order Preferences</h2>
      <p className="settings-section-description">
        Customize how you receive order updates and delivery preferences.
      </p>

      <form className="settings-form">
        {/* Delivery Slot */}
        <div className="settings-form-group">
          <label className="settings-label">Preferred Delivery Time</label>
          <select
            name="deliverySlot"
            value={formData.deliverySlot}
            onChange={handleChange}
            className="settings-select"
          >
            <option value="morning">Morning (8AM - 12PM)</option>
            <option value="afternoon">Afternoon (12PM - 4PM)</option>
            <option value="evening">Evening (4PM - 8PM)</option>
          </select>
        </div>

        {/* Notifications */}
        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1.5px solid var(--border-light)" }}>
          <p className="settings-section-title" style={{ marginBottom: "20px" }}>
            Notifications
          </p>

          {/* Email Notifications */}
          <label className="settings-checkbox">
            <input
              type="checkbox"
              name="emailNotif"
              checked={formData.emailNotif}
              onChange={handleChange}
            />
            <span>Email notifications for order status updates</span>
          </label>

          {/* SMS Notifications */}
          <label className="settings-checkbox">
            <input
              type="checkbox"
              name="smsNotif"
              checked={formData.smsNotif}
              onChange={handleChange}
            />
            <span>SMS notifications for order status updates</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSave}
          className="btn-save-settings"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
}
