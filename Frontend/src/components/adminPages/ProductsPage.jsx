import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { Eye, Filter, Grid, List, Pencil, Plus, Search, Star, Trash2, Package, Tag } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import "./admin.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function ProductPage() {
  const { items: products, loading, error } = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories.items);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [deleting, setDeleting] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "all" || category === "" || product.category === category)
  );

  const handlePopular = async (id) => {
    try {
      const res = await axios.patch(`${url}/products/togglePopular/${id}`, {}, { withCredentials: true });
      if (!res.data.success) throw new Error("Toggle failed");
      window.location.reload();
    } catch (err) {
      console.error("Toggle error:", err.message);
      alert("Failed to toggle popular");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setDeleting(id);
      const res = await axios.delete(`${url}/products/deleteProduct/${id}`, { withCredentials: true });
      if (!res.data.success) throw new Error("Delete failed");
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product");
    } finally {
      setDeleting("");
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Product Management</h1>
          <p className="admin-page-subtitle">{filteredProducts.length} products in total</p>
        </div>
        <div style={{display: "flex", gap: "12px"}}>
          <Button className="admin-btn-secondary" onClick={() => navigate("/admin/sales")}>
            <Tag size={18} /> Manage Sales
          </Button>
          <Link to="/admin/add">
            <Button className="admin-btn-primary">
              <Plus size={18} /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="admin-filters-bar">
        {/* Search */}
        <div className="admin-filter-search">
          <Search size={20} className="admin-search-icon" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        {/* Category Filter */}
        <div className="admin-filter-select-wrapper">
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger>
              <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                <Filter size={16} />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span style={{fontWeight: "600"}}>All Categories</span>
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="admin-view-toggle">
          <button
            onClick={() => setViewMode("grid")}
            className={`admin-view-btn ${viewMode === "grid" ? "active" : ""}`}
            aria-label="Grid view"
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`admin-view-btn ${viewMode === "list" ? "active" : ""}`}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-empty-state">
          <Package size={64} strokeWidth={1} />
          <h3>No Products Found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="admin-products-grid">
          {filteredProducts.map((product) => (
            <div key={product._id} className="admin-product-card">
              <div className="admin-product-image-wrapper">
                <img
                  src={product.images?.[0].url}
                  alt={product.name}
                  className="admin-product-image"
                />
                {product.isOnSale && (
                  <div className="admin-product-sale-badge">{product.salePercentage}% OFF</div>
                )}
                <div className="admin-product-category">{product.category}</div>
              </div>
              
              <div className="admin-product-content">
                <h3 className="admin-product-name">{product.name}</h3>
                
                <div className="admin-product-meta">
                  <div className="admin-product-price-container">
                    {product.isOnSale ? (
                      <>
                        <span className="admin-product-price-original">PKR {product.price}</span>
                        <span className="admin-product-price-sale">PKR {Math.round(product.price - (product.price * product.salePercentage / 100))}</span>
                      </>
                    ) : (
                      <span className="admin-product-price">PKR {product.price}</span>
                    )}
                  </div>
                  <div className="admin-product-rating">
                    <Star size={16} fill="currentColor" />
                    <span>{product.averageRating?.toFixed(1) || "0.0"}</span>
                  </div>
                </div>

                <div className="admin-product-popular">
                  <span>Featured</span>
                  <Switch 
                    checked={product.popular} 
                    onCheckedChange={() => handlePopular(product._id)} 
                  />
                </div>

                <div className="admin-product-actions">
                  <Button variant="secondary" asChild size="sm">
                    <Link to={`/admin/edit/${product._id}`}>
                      <Pencil size={16} /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="sm">
                    <Link to={`/admin/reviews/${product._id}`}>
                      <Eye size={16} /> Reviews
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleting === product._id}
                    onClick={() => handleDelete(product._id)}
                  >
                    <Trash2 size={16} /> 
                    {deleting === product._id ? "..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-products-list">
          {filteredProducts.map((product) => (
            <div key={product._id} className="admin-product-list-item">
              <img
                src={product.images?.[0].url}
                alt={product.name}
                className="admin-product-list-image"
              />
              
              <div className="admin-product-list-content">
                <div>
                  <h3 className="admin-product-list-name">{product.name}</h3>
                  <span className="admin-product-list-category">{product.category}</span>
                  {product.isOnSale && (
                    <span className="admin-product-list-sale">{product.salePercentage}% OFF</span>
                  )}
                </div>
                
                <div className="admin-product-list-meta">
                  {product.isOnSale ? (
                    <div className="admin-product-price-group">
                      <span className="admin-product-price-original">PKR {Math.round(product.price).toLocaleString()}</span>
                      <span className="admin-product-price-sale">
                        PKR {Math.round(product.price - (product.price * product.salePercentage / 100)).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="admin-product-price">PKR {Math.round(product.price).toLocaleString()}</span>
                  )}
                  <div className="admin-product-rating">
                    <Star size={16} fill="currentColor" />
                    <span>{product.averageRating?.toFixed(1) || "0.0"}</span>
                  </div>
                </div>
              </div>

              <div className="admin-product-list-actions">
                <Switch 
                  checked={product.popular} 
                  onCheckedChange={() => handlePopular(product._id)} 
                />
                
                <div className="admin-product-actions">
                  <Button variant="secondary" asChild size="sm">
                    <Link to={`/admin/edit/${product._id}`}>
                      <Pencil size={16} />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="sm">
                    <Link to={`/admin/reviews/${product._id}`}>
                      <Eye size={16} />
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleting === product._id}
                    onClick={() => handleDelete(product._id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}