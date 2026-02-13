import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { decrementQty, incrementQty, removeFromCart } from "../redux/cartSlicer";
import { Trash2, ShoppingBag } from "lucide-react";
import "./cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { items: products } = useSelector((state) => state.products);
  const dispatch = useDispatch();

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
  const shipping = 150;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate("/checkout");
    }
  };

  return (
    <div className="cart-container">
      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px" }}>
        <div className="cart-header">
          <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
          <h1>Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag className="w-20 h-20 mx-auto mb-6" strokeWidth={1} />
            <p>Your cart is empty. Start shopping to add items!</p>
            <button onClick={() => navigate("/shop")} className="btn-checkout">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Cart Items */}
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const latestProduct = products.find((p) => p._id === item._id);
                const currentStock = latestProduct?.stockQuantity || item.stockQuantity || 0;
                const canIncrement = item.qty < currentStock;
                const insufficientStock = item.qty > currentStock;
                const basePrice = Number(latestProduct?.price ?? item.price) || 0;
                const discount = Number(latestProduct?.salePercentage ?? item.salePercentage) || 0;
                const isOnSale = latestProduct?.isOnSale ?? item.isOnSale;
                const effectivePrice = getEffectivePrice(item, latestProduct);

                return (
                  <div 
                    key={item._id} 
                    className="cart-item"
                    style={{
                      background: insufficientStock ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                      borderLeft: insufficientStock ? '4px solid var(--error)' : 'none',
                      paddingLeft: insufficientStock ? '12px' : '0'
                    }}
                  >
                    {/* Product Image */}
                    <div className="cart-item-image">
                      {item.images?.[0]?.url || item.image ? (
                        <img
                          src={item.images?.[0]?.url || item.image}
                          alt={item.name}
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="cart-item-content">
                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        {item.category && (
                          <p className="cart-item-category">{item.category}</p>
                        )}
                        {insufficientStock && (
                          <p style={{ fontSize: '12px', color: 'var(--error)', fontWeight: '600', marginTop: '4px' }}>
                            ⚠️ Only {currentStock} available in stock
                          </p>
                        )}
                        {!insufficientStock && currentStock <= 5 && currentStock > 0 && (
                          <p style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', marginTop: '4px' }}>
                            ⚡ Only {currentStock} left in stock
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="cart-item-meta">
                        <div className="cart-item-qty">
                          <button
                            onClick={() => dispatch(decrementQty(item._id))}
                            disabled={item.qty <= 1}
                            className="qty-btn-cart"
                          >
                            −
                          </button>
                          <span className="qty-display-cart">{item.qty}</span>
                          <button
                            onClick={() => dispatch(incrementQty(item._id))}
                            disabled={!canIncrement}
                            className="qty-btn-cart"
                            title={!canIncrement ? `Maximum ${currentStock} available` : ''}
                          >
                            +
                          </button>
                        </div>
                        {isOnSale && discount > 0 ? (
                          <div className="cart-item-price-group">
                            <span className="cart-item-price-original">
                              PKR {Math.round(basePrice * item.qty).toLocaleString()}
                            </span>
                            <span className="cart-item-price-sale">
                              PKR {Math.round(effectivePrice * item.qty).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <p className="cart-item-price">
                            PKR {Math.round(effectivePrice * item.qty).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="cart-item-remove"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-line">
                <span>Subtotal</span>
                <span className="summary-line-value">
                  PKR {Math.round(subtotal).toLocaleString()}
                </span>
              </div>

              <div className="summary-line">
                <span>Shipping</span>
                <span className="summary-line-value">
                  PKR {Math.round(shipping).toLocaleString()}
                </span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-value">
                  PKR {Math.round(total).toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="btn-checkout"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/shop")}
                className="btn-continue-shopping"
              >
                Continue Shopping
              </button>

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "24px",
                  borderTop: "1.5px solid var(--border-light)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                  ✓ Secure Checkout
                  <br />
                  ✓ Easy Returns
                  <br />✓ Free Support
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
