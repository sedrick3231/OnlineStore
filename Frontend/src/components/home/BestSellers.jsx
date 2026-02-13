import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import StarRatingDisplay from "../Products/StarRatingDisplay";
import { addToCart } from "../../redux/cartSlicer";
import "./home.css";

export default function PopularProducts() {
  const products = useSelector((state) => state.products.items);
  const dispatch = useDispatch();
  const popularProducts = products.filter((product) => product.popular);
  const [quantities, setQuantities] = useState({});

  const getSalePrice = (product) => {
    const basePrice = Number(product.price) || 0;
    const discount = Number(product.salePercentage) || 0;
    return Math.round(basePrice - (basePrice * discount) / 100);
  };

  const getQty = (id) => quantities[id] ?? 1;
  const updateQty = (id, delta, stockQuantity = 99) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const maxQty = Math.min(99, stockQuantity || 99);
      const next = Math.min(maxQty, Math.max(1, current + delta));
      return { ...prev, [id]: next };
    });
  };

  return (
    <section className="home-section home-section--tint">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">
            <Sparkles size={16} />
            Featured Collection
          </div>
          <h2 className="section-title">Best Sellers</h2>
          <p className="section-subtitle">Discover our most loved designer suits, handpicked for elegance and quality.</p>
          <div className="section-divider" />
        </div>

        <div className="product-grid">
          {popularProducts.length === 0 ? (
            <p className="section-subtitle">No popular products available.</p>
          ) : (
            popularProducts.map((product) => (
              <Link key={product._id} to={`/show-product/${product._id}`} className="product-card" aria-label={`View details for ${product.name}`}>
                <div className="product-media">
                  {product.popular && <div className="product-badge">Bestseller</div>}
                  {product.isOnSale && (
                    <div className="product-sale-badge">{product.salePercentage}% OFF</div>
                  )}
                  <img
                    src={
                      product.images?.[0]?.url
                        ? product.images[0].url.replace("/upload/", "/upload/q_auto,f_auto/")
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    loading="lazy"
                    className="product-image"
                  />
                </div>

                <div className="product-body">
                  <div>
                    <h3 className="product-title line-clamp-2">{product.name}</h3>
                    <div style={{ marginTop: 8 }}>
                      <StarRatingDisplay rating={product.averageRating || 0} count={product.reviewCount || 0} />
                    </div>
                    <div className="product-stock">
                      {product.stockQuantity > 0 ? (
                        <span className="stock-available">
                          {product.stockQuantity <= 5 ? (
                            <>
                              <span className="stock-warning">⚠️ Only {product.stockQuantity} left!</span>
                            </>
                          ) : (
                            <>
                              <span className="stock-in-stock"> {product.stockQuantity} in stock</span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="stock-unavailable">Out of Stock</span>
                      )}
                    </div>
                  </div>
                  <div className="product-meta">
                    <div className="product-price-group">
                      {product.isOnSale ? (
                        <>
                          <span className="product-price-original">PKR {Math.round(product.price || 0).toLocaleString()}</span>
                          <span className="product-price-sale">PKR {getSalePrice(product).toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="product-price">PKR {product.price?.toLocaleString() || "0"}</span>
                      )}
                    </div>
                    <div className="product-actions">
                      <div className="product-qty">
                        <button
                          type="button"
                          className="product-qty-btn"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            updateQty(product._id, -1, product.stockQuantity || 99);
                          }}
                          disabled={getQty(product._id) <= 1 || product.stockQuantity === 0}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="product-qty-value">{getQty(product._id)}</span>
                        <button
                          type="button"
                          className="product-qty-btn"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            updateQty(product._id, 1, product.stockQuantity || 99);
                          }}
                          disabled={getQty(product._id) >= (product.stockQuantity || 99) || product.stockQuantity === 0}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="product-add-btn"
                        disabled={product.stockQuantity === 0}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          dispatch(addToCart({ ...product, qty: getQty(product._id) }));
                        }}
                      >
                        {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
