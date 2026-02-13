import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../redux/cartSlicer";
import RatingsSection from "./RatingSection";
import StarRatingDisplay from "./StarRatingDisplay";
import "./product-detail.css";

export default function ProductDetails({ product }) {
  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0]?.url || ""
  );
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const incrementQty = () => {
    const maxStock = product.stockQuantity || 99;
    setQuantity((q) => (q < maxStock ? q + 1 : q));
  };
  const decrementQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const getSalePrice = () => {
    const basePrice = Number(product?.price) || 0;
    const discount = Number(product?.salePercentage) || 0;
    return Math.round(basePrice - (basePrice * discount) / 100);
  };

  const HandleAddtoCart = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const storedCart = localStorage.getItem("cart");
    let cartItems = [];

    try {
      cartItems = storedCart ? JSON.parse(storedCart) : [];
      if (!Array.isArray(cartItems)) cartItems = [];
    } catch (e) {
      console.error("Error parsing cart:", e);
      cartItems = [];
    }

    const existingItemIndex = cartItems.findIndex(
      (item) => item._id === product._id
    );

    if (existingItemIndex !== -1) {
      cartItems[existingItemIndex].qty =
        (Number(cartItems[existingItemIndex].qty) || 1) + quantity;
    } else {
      cartItems.push({ ...product, qty: quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
    dispatch(addToCart({ ...product, qty: quantity }));
    setQuantity(1);
  };

  return (
    <div
      className="product-detail-container"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="product-main-image">
            <img
              src={selectedImage}
              alt={product.name || "Product image"}
            />
          </div>

          <div className="product-thumbnails">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img.url)}
                className={`product-thumbnail ${img.url === selectedImage ? "active" : ""}`}
                aria-label={`Select image ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt={`${product.name || "Product"} thumbnail ${i + 1}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="product-details">
          <div className="product-info-card">
            <div className="product-meta">
              <h2 className="product-title">{product.name}</h2>
              {product.isOnSale && (
                <div className="product-sale-badge">{product.salePercentage}% OFF</div>
              )}
              <div className="product-price-group">
                {product.isOnSale ? (
                  <>
                    <span className="product-price-original">PKR {Math.round(product.price).toLocaleString()}</span>
                    <span className="product-price-sale">PKR {getSalePrice().toLocaleString()}</span>
                  </>
                ) : (
                  <span className="product-price">PKR {Math.round(product.price).toLocaleString()}</span>
                )}
              </div>
              <div className="product-rating">
                <StarRatingDisplay
                  rating={product.averageRating || 0}
                  count={product.reviewCount || 0}
                />
              </div>
              <div className="product-stock-detail">
                {product.stockQuantity > 0 ? (
                  <span className="stock-available-detail">
                    {product.stockQuantity <= 5 ? (
                      <>
                        <span className="stock-warning-detail">⚠️ Only {product.stockQuantity} left!</span>
                      </>
                    ) : (
                      <>
                        <span className="stock-in-stock-detail"> {product.stockQuantity} in stock</span>
                      </>
                    )}
                  </span>
                ) : (
                  <span className="stock-unavailable-detail">Out of Stock</span>
                )}
              </div>
              <p className="product-description">
                {product.description?.feature?.split(/\n/)[0] || "Premium quality traditional Pakistani clothing"}
              </p>
            </div>

            <div className="product-actions">
              <div className="quantity-section">
                <label className="quantity-label">Quantity</label>
                <div className="quantity-controls">
                  <div className="quantity-picker">
                    <button
                      onClick={decrementQty}
                      className="qty-btn"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1 || product.stockQuantity === 0}
                    >
                      −
                    </button>
                    <span className="qty-display">{quantity}</span>
                    <button
                      onClick={incrementQty}
                      className="qty-btn"
                      aria-label="Increase quantity"
                      disabled={quantity >= (product.stockQuantity || 99) || product.stockQuantity === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={HandleAddtoCart}
                className="btn-add-to-cart"
                disabled={product.stockQuantity === 0}
              >
                {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="product-tabs-section">
        <div className="product-tab-content">
          <h3 className="product-tab-title">Fabric & Details</h3>
          <ul className="product-list">
            {product.description?.feature
              ?.split(/(\n|\n\n|\s*\|\|\s*)/)
              .filter((line) => line.trim() && line.trim() !== "||")
              .map((line, i) => (
                <li key={i}>{line.trim()}</li>
              ))}
          </ul>
        </div>

        <div className="product-tab-content">
          <h3 className="product-tab-title">Dupatta</h3>
          <ul className="product-list">
            {product.description?.specifications
              ?.split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <li key={i}>{line.trim()}</li>
              ))}
          </ul>
        </div>

        <div className="product-tab-content product-tab-content--full product-review-card">
          <RatingsSection product={product} />
        </div>
      </div>
    </div>
  );
}