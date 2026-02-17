// ElegantCheckoutPage.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { createOrder, getOrder } from "../../redux/OrderSlicer";
import { clearCart } from "../../redux/cartSlicer";
import { updateUser } from "../../redux/userSlicer";
import { CheckCircle, Truck, ArrowRight, MapPin, Plus } from "lucide-react";
import "../../pages/checkout.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function ElegantCheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const { items: products } = useSelector((state) => state.products);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shippingData, setShippingData] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  
  // Check if user has a saved shipping address
  const hasSavedAddress = user?.ShippingAddress && user?.ShippingAddress?.address;
  const [useSavedAddress, setUseSavedAddress] = useState(hasSavedAddress ? true : false);

  const {
    register: registerShipping,
    handleSubmit: handleSubmitShipping,
    formState: { errors: shippingErrors },
  } = useForm({
    defaultValues: hasSavedAddress 
      ? { ...user.ShippingAddress, fullName: user?.name }
      : {},
  });

  const getEffectivePrice = (item, latestProduct) => {
    const basePrice = Number(latestProduct?.price ?? item.price) || 0;
    const discount = Number(latestProduct?.salePercentage ?? item.salePercentage) || 0;
    const isOnSale = latestProduct?.isOnSale ?? item.isOnSale;
    if (isOnSale && discount > 0) {
      return Math.round(basePrice - (basePrice * discount) / 100);
    }
    return basePrice;
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const latestProduct = products.find((p) => p._id === item._id);
    return sum + getEffectivePrice(item, latestProduct) * item.qty;
  }, 0);
  const tax = subtotal * 0.1;
  const totalAmount = subtotal + tax;

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
    dispatch(getOrder({}));
  }, [user]);

  const onSubmitShipping = (data) => {
    if (useSavedAddress && hasSavedAddress) {
      // Use the saved address from profile with user's name
      setShippingData({
        ...user.ShippingAddress,
        fullName: user?.name,
      });
    } else {
      // Use the form data (new address)
      setShippingData(data);
    }
    setStep(2);
  };

  const onSubmitPayment = async () => {
    if (!cartItems.length) return toast.error("Your cart is empty!");

    // Validate stock availability before placing order - Check against latest product stock from Redux
    const stockErrors = [];
    cartItems.forEach((item) => {
      // Get the latest product from Redux store
      const latestProduct = products.find((p) => p._id === item._id);
      const availableStock = latestProduct?.stockQuantity || item.stockQuantity || 0;
      
      if (item.qty > availableStock) {
        stockErrors.push(
          `${item.name}: Only ${availableStock} in stock, but ${item.qty} requested`
        );
      }
      if (availableStock === 0) {
        stockErrors.push(`${item.name}: Out of stock`);
      }
    });

    if (stockErrors.length > 0) {
      stockErrors.forEach((error) => toast.error(error));
      return;
    }

    // If user doesn't have a saved address and used a new address, save it as default
    if (!hasSavedAddress && shippingData && !useSavedAddress) {
      try {
        const shippingAddress = {
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state,
          postalCode: shippingData.postalCode,
          phone: shippingData.phone,
        };

        await axios.post(
          `${url}/user/settings/updateAddress/${user._id}`,
          { shippingAddress },
          { withCredentials: true }
        );
        
        // Update Redux store with new address
        dispatch(updateUser({ ShippingAddress: shippingAddress }));
      } catch (error) {
        console.error("Failed to save default address:", error);
        // Don't block order if address save fails
      }
    }

    const productsForOrder = cartItems.map((item) => ({
      productId: item._id,
      quantity: item.qty,
    }));
    const payload = {
      userId: user._id,
      shippingAddress: shippingData,
      paymentMethod: "cod",
      products: productsForOrder,
      totalAmount,
    };

    setLoading(true);
    dispatch(createOrder(payload))
      .unwrap()
      .then(() => {
        toast.success("Order placed successfully! We'll contact you soon.");
        setStep(3);
        dispatch(clearCart([]));
        dispatch(updateUser({ Orders: user.Orders + 1 }));
      })
      .catch((err) => {
        const errorMsg = typeof err === 'object' ? err.message : err;
        toast.error(errorMsg || "Order failed. Please try again.");
        setLoading(false);
      });
  };

  return (
    <section className="checkout-container">
      <div className="container">
        <div className="checkout-header">
          <h1 className="checkout-title">Secure Checkout</h1>
        </div>

        <div className="checkout-progress">
          {[
            { num: 1, label: "Shipping" },
            { num: 2, label: "Review" },
            { num: 3, label: "Complete" }
          ].map((item) => (
            <div
              key={item.num}
              className={`progress-step ${step > item.num ? 'completed' : step === item.num ? 'active' : ''}`}
            >
              <div className="progress-number">
                {step > item.num ? '✓' : item.num}
              </div>
              <span className="progress-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="checkout-grid">
          {/* Main Form */}
          <div className="checkout-form">
            {step === 1 && (
              <form onSubmit={handleSubmitShipping(onSubmitShipping)} className="space-y-0">
                {/* Address Selection Options */}
                {hasSavedAddress && (
                  <div className="form-section" style={{ background: 'rgba(34, 197, 94, 0.05)', borderLeft: '4px solid #22c55e', marginBottom: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)', marginBottom: '12px', margin: 0 }}>
                        Select Shipping Address
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                      {/* Option 1: Use Saved Address */}
                      <label style={{
                        padding: '12px',
                        border: useSavedAddress ? '2px solid #22c55e' : '1.5px solid #e5e7eb',
                        borderRadius: '10px',
                        background: useSavedAddress ? 'rgba(34, 197, 94, 0.1)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                        className="dark:bg-gray-800 dark:border-gray-600"
                      >
                        <input
                          type="radio"
                          name="addressOption"
                          checked={useSavedAddress}
                          onChange={() => setUseSavedAddress(true)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginTop: '2px',
                            accentColor: '#22c55e'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', margin: '0 0 4px 0' }}>
                            Use Default Shipping Address
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                            {user?.name} • {user?.ShippingAddress?.city}
                          </p>
                        </div>
                      </label>

                      {/* Option 2: Use Different Address */}
                      <label style={{
                        padding: '12px',
                        border: !useSavedAddress ? '2px solid #1a5f5a' : '1.5px solid #e5e7eb',
                        borderRadius: '10px',
                        background: !useSavedAddress ? 'rgba(26, 95, 90, 0.1)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                        className="dark:bg-gray-800 dark:border-gray-600"
                      >
                        <input
                          type="radio"
                          name="addressOption"
                          checked={!useSavedAddress}
                          onChange={() => setUseSavedAddress(false)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginTop: '2px',
                            accentColor: '#1a5f5a'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', margin: '0 0 4px 0' }}>
                            Provide New Address
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                            Enter a different shipping address
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Show Saved Address Card */}
                {hasSavedAddress && useSavedAddress && (
                  <div className="form-section" style={{ background: 'rgba(34, 197, 94, 0.08)', borderLeft: '4px solid #22c55e', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
                        <MapPin size={18} style={{ color: '#22c55e' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px', margin: 0 }}>
                          {user?.name}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0, marginBottom: '4px' }}>
                          {user?.ShippingAddress?.address}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0, marginBottom: '4px' }}>
                          {user?.ShippingAddress?.city}, {user?.ShippingAddress?.state} {user?.ShippingAddress?.postalCode}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                          Phone: {user?.ShippingAddress?.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Form Only if Not Using Saved Address */}
                {!useSavedAddress && (
                  <>
                    <div className="form-section">
                      <div className="section-title">Shipping Information</div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input
                            {...registerShipping("fullName", { required: "Full name is required" })}
                            type="text"
                            placeholder="John Doe"
                            className="form-input"
                          />
                          {shippingErrors.fullName && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{shippingErrors.fullName.message}</p>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Mobile Number *</label>
                          <input
                            {...registerShipping("phone", { required: "Mobile number is required", pattern: { value: /^(0?3)\d{9}$/, message: "Enter valid Pakistan mobile (03XXXXXXXXX)" } })}
                            type="tel"
                            placeholder="03XXXXXXXXX"
                            className="form-input"
                          />
                          {shippingErrors.phone && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{shippingErrors.phone.message}</p>}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Address *</label>
                        <textarea
                          {...registerShipping("address", { required: "Address is required" })}
                          placeholder="Enter your complete address"
                          rows="3"
                          className="form-input"
                          style={{ resize: 'vertical' }}
                        ></textarea>
                        {shippingErrors.address && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{shippingErrors.address.message}</p>}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">City *</label>
                          <select
                            {...registerShipping("city", { required: "City is required" })}
                            className="form-select"
                          >
                            <option value="">Select a city</option>
                            {['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Faisalabad','Multan','Hyderabad'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          {shippingErrors.city && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{shippingErrors.city.message}</p>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">State/Province *</label>
                          <input
                            {...registerShipping("state", { required: "State is required" })}
                            type="text"
                            placeholder="e.g., Sindh"
                            className="form-input"
                          />
                          {shippingErrors.state && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{shippingErrors.state.message}</p>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Postal Code *</label>
                          <input
                            {...registerShipping("postalCode", { required: "Postal code is required" })}
                            type="text"
                            placeholder="e.g., 75000"
                            className="form-input"
                          />
                          {shippingErrors.postalCode && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{shippingErrors.postalCode.message}</p>}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-section" style={{ background: 'rgba(99, 102, 241, 0.05)', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Truck size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>Cash on Delivery</h3>
                      <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Pay when your order arrives. We deliver to all major cities in Pakistan.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-place-order"
                  style={{ marginTop: '24px' }}
                >
                  Continue to Review
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); onSubmitPayment(); }} className="space-y-0">
                <div className="form-section" style={{ background: 'rgba(34, 197, 94, 0.05)', borderLeft: '4px solid #22c55e' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>Cash on Delivery Selected</h3>
                      <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        Pay when your order arrives at your doorstep.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Delivery Address</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: '600', margin: 0 }}>{shippingData?.fullName}</p>
                    <p style={{ color: 'var(--text)', margin: 0 }}>{shippingData?.address}</p>
                    <p style={{ color: 'var(--text)', margin: 0 }}>{shippingData?.city}, {shippingData?.state} {shippingData?.postalCode}</p>
                    <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Phone: {shippingData?.phone}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-place-order"
                    style={{ background: 'var(--surface)', color: 'var(--primary)', flex: 1 }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-place-order"
                    style={{ flex: 1, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    {loading ? "Confirming..." : "Confirm Order"}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="order-confirmation">
                <div className="confirmation-icon">
                  <CheckCircle size={40} />
                </div>
                <h2 className="confirmation-title">Order Placed Successfully!</h2>
                <p className="confirmation-number">Thank you for your order. We'll contact you soon to confirm delivery details.</p>
                
                <div style={{ 
                  background: 'rgba(99, 102, 241, 0.05)', 
                  border: '1.5px solid rgba(99, 102, 241, 0.2)', 
                  borderRadius: '14px', 
                  padding: '16px', 
                  marginBottom: '24px',
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px', margin: 0 }}>
                    What's next?
                  </p>
                  <ul style={{ fontSize: '13px', color: 'var(--muted)', margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li>Order confirmation sent to your email</li>
                    <li>We'll contact you within 24 hours</li>
                    <li>Pay upon delivery (COD)</li>
                  </ul>
                </div>

                <button
                  onClick={() => navigate("/shop")}
                  className="btn-place-order"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Order Summary - Sidebar */}
          <div className="order-summary">
            <div className="summary-header">Order Summary</div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: 'var(--space-lg)' }}>
              {cartItems.map((item) => {
                const latestProduct = products.find((p) => p._id === item._id);
                const currentStock = latestProduct?.stockQuantity || item.stockQuantity || 0;
                const insufficientStock = item.qty > currentStock;
                const basePrice = Number(latestProduct?.price ?? item.price) || 0;
                const discount = Number(latestProduct?.salePercentage ?? item.salePercentage) || 0;
                const isOnSale = latestProduct?.isOnSale ?? item.isOnSale;
                const effectivePrice = getEffectivePrice(item, latestProduct);
                
                return (
                  <div 
                    key={item._id} 
                    className="summary-item"
                    style={{
                      background: insufficientStock ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                      borderLeft: insufficientStock ? '3px solid var(--error)' : 'none',
                      paddingLeft: insufficientStock ? '10px' : '0'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '13px', marginBottom: '2px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                        Qty: {item.qty}
                      </div>
                      {insufficientStock && (
                        <div style={{ fontSize: '11px', color: 'var(--error)', fontWeight: '600' }}>
                          ⚠️ Only {currentStock} available
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--primary)', textAlign: 'right' }}>
                      {isOnSale && discount > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'line-through' }}>
                            PKR {(basePrice * item.qty).toLocaleString()}
                          </span>
                          <span>
                            PKR {(effectivePrice * item.qty).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span>PKR {(effectivePrice * item.qty).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-item">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">PKR {Math.round(subtotal).toLocaleString()}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Tax (10%)</span>
              <span className="summary-value">PKR {Math.round(tax).toLocaleString()}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span className="summary-total-label">Total</span>
              <span className="summary-total-value">PKR {Math.round(totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
