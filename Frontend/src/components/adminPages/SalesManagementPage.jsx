import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { X, Percent, ArrowRight, CheckCircle, AlertCircle, Loader, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "./admin.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function SalesManagementPage() {
  const navigate = useNavigate();
  const products = useSelector((state) => state.products?.items || []);
  
  const [saleType, setSaleType] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [salePercentage, setSalePercentage] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate sale price for preview
  const getPreviewPrice = () => {
    if (!salePercentage) return null;
    
    const productPrice = selectedProduct
      ? products.find(p => p._id === selectedProduct)?.price
      : products[0]?.price;
    
    if (!productPrice) return null;
    return Math.round(productPrice - (productPrice * salePercentage / 100));
  };

  const handleApplySale = async () => {
    if (!salePercentage || salePercentage < 1 || salePercentage > 90) {
      toast.error("Please enter a valid discount (1-90%)");
      return;
    }

    if (saleType === "single" && !selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    setLoading(true);
    try {
      const endpoint = saleType === "all" 
        ? `${url}/products/apply-sale-all`
        : `${url}/products/apply-sale/${selectedProduct}`;

      const res = await axios.patch(endpoint, {
        salePercentage: Number(salePercentage)
      }, { withCredentials: true });

      toast.success(
        saleType === "all" 
          ? `Sale applied to all ${res.data.modifiedCount} products!` 
          : `Sale applied successfully!`
      );
      
      // Reset form
      setSalePercentage("");
      setSelectedProduct("");
      
      // Navigate back after success
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (error) {
      console.error("Sale error:", error);
      toast.error(error.response?.data?.message || "Failed to apply sale");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSale = async () => {
    if (saleType === "single" && !selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    setLoading(true);
    try {
      const endpoint = saleType === "all"
        ? `${url}/products/remove-sale-all`
        : `${url}/products/remove-sale/${selectedProduct}`;

      const res = await axios.patch(endpoint, {}, { withCredentials: true });

      toast.success(
        saleType === "all"
          ? `Removed sale from all products!`
          : `Sale removed successfully!`
      );

      setSalePercentage("");
      setSelectedProduct("");
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (error) {
      console.error("Remove sale error:", error);
      toast.error(error.response?.data?.message || "Failed to remove sale");
    } finally {
      setLoading(false);
    }
  };

  const getSaleProducts = () => products.filter(p => p.isOnSale);
  const saleProducts = getSaleProducts();
  const selectedProductData = selectedProduct ? products.find(p => p._id === selectedProduct) : null;

  return (
    <div className="sales-management-page">
      {/* Header */}
      <div className="sales-page-header-bar">
        <button
          onClick={() => navigate("/admin/products")}
          className="sales-page-back-btn"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div>
          <h1 className="sales-page-title">Sales Management</h1>
          <p className="sales-page-subtitle">Manage product discounts and promotions</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="sales-page-container">
        <div className="sales-page-grid">
          {/* Left Section - Form */}
          <div className="sales-form-section">
            <h2>Apply Discount</h2>

            {/* Sale Type Selection */}
            <div className="sales-form-group">
              <label className="sales-form-label">What would you like to do?</label>
              <div className="sales-radio-group">
                <label className="sales-radio-option">
                  <input
                    type="radio"
                    value="all"
                    checked={saleType === "all"}
                    onChange={(e) => {
                      setSaleType(e.target.value);
                      setSelectedProduct("");
                    }}
                  />
                  <span className="sales-radio-label">Apply to All Products</span>
                </label>
                <label className="sales-radio-option">
                  <input
                    type="radio"
                    value="single"
                    checked={saleType === "single"}
                    onChange={(e) => setSaleType(e.target.value)}
                  />
                  <span className="sales-radio-label">Apply to Specific Product</span>
                </label>
              </div>
            </div>

            {/* Product Selection */}
            {saleType === "single" && (
              <div className="sales-form-group">
                <label className="sales-form-label">Select Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="sales-form-input"
                >
                  <option value="">Choose a product...</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - PKR {Math.round(product.price)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Percentage Input */}
            <div className="sales-form-group">
              <label className="sales-form-label">Discount Percentage</label>
              <input
                type="number"
                min="1"
                max="90"
                value={salePercentage}
                onChange={(e) => setSalePercentage(e.target.value)}
                placeholder="Enter percentage (1-90)"
                className="sales-form-input"
                disabled={loading}
              />
              <p className="sales-helper-text">Discount must be between 1% and 90%</p>
            </div>

            {/* Action Buttons */}
            <div className="sales-form-buttons">
              <button
                onClick={handleRemoveSale}
                disabled={loading}
                className="sales-form-btn sales-form-btn-danger"
              >
                {loading && <Loader size={16} className="sales-form-loading" />}
                Remove Existing Sale
              </button>
              <button
                onClick={handleApplySale}
                disabled={loading || !salePercentage}
                className="sales-form-btn sales-form-btn-primary"
              >
                {loading && <Loader size={16} className="sales-form-loading" />}
                Apply Discount
              </button>
            </div>
          </div>

          {/* Right Section - Preview & Stats */}
          <div className="sales-preview-section">
            <h2>Preview & Insights</h2>

            {salePercentage && (
              <div className="sales-price-card">
                {saleType === "single" && selectedProductData ? (
                  <>
                    <div className="sales-price-row">
                      <span className="sales-price-label">Product</span>
                      <span className="sales-price-value">{selectedProductData.name}</span>
                    </div>
                    <div className="sales-price-row">
                      <span className="sales-price-label">Original</span>
                      <span className="sales-price-value sales-price-original">
                        PKR {Math.round(selectedProductData.price)}
                      </span>
                    </div>
                    <div className="sales-price-row">
                      <span className="sales-price-label">Sale Price</span>
                      <span className="sales-price-value sales-price-sale">PKR {getPreviewPrice()}</span>
                    </div>
                    <div className="sales-price-row">
                      <span className="sales-price-label">Savings</span>
                      <span className="sales-price-value sales-price-savings">
                        PKR {Math.round(selectedProductData.price - getPreviewPrice())}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sales-price-row">
                      <span className="sales-price-label">Products affected</span>
                      <span className="sales-price-value">{products.length}</span>
                    </div>
                    <div className="sales-price-row">
                      <span className="sales-price-label">Discount</span>
                      <span className="sales-price-value sales-price-sale">{salePercentage}%</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="sales-stats-card">
              <div className="sales-stats-title">Live Metrics</div>
              <div className="sales-stats-grid">
                <div className="sales-stat-item">
                  <span className="sales-stat-value">{saleProducts.length}</span>
                  <span className="sales-stat-label">On Sale</span>
                </div>
                <div className="sales-stat-item">
                  <span className="sales-stat-value">{products.length}</span>
                  <span className="sales-stat-label">Total Products</span>
                </div>
              </div>
            </div>

            <div className="sales-products-on-sale">
              <h3>Products on Sale</h3>
              {saleProducts.length > 0 ? (
                <div className="sales-product-list">
                  {saleProducts.slice(0, 8).map((product) => (
                    <div key={product._id} className="sales-product-item">
                      <span className="sales-product-name">{product.name}</span>
                      <span className="sales-product-discount">{product.salePercentage}% OFF</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sales-empty-state">
                  <p>No products currently on sale.</p>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Current Sales Stats */}
          <div className="sales-stats-card">
            <h3 className="sales-stats-title">Current Sales</h3>
            <div className="sales-stat-item">
              <span className="sales-stat-label">Products on Sale</span>
              <span className="sales-stat-value">{saleProducts.length}</span>
            </div>
            {saleProducts.length > 0 && (
              <div className="sales-product-list">
                {saleProducts.map((product) => (
                  <div key={product._id} className="sales-product-item">
                    <span className="sales-product-name">{product.name}</span>
                    <span className="sales-product-discount">{product.salePercentage}% OFF</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
