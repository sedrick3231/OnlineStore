import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import StarRatingDisplay from "../components/Products/StarRatingDisplay";
import { addToCart } from "../redux/cartSlicer";
import "./shop.css";

function FilterPanel({
  filters,
  categories,
  onFilterChange,
  priceInputs,
  onPriceInputChange,
  onApplyPrice,
  onClearFilters,
}) {
  return (
    <div className="shop-filter-card">
      <div className="shop-filter-title">
        <Filter className="w-5 h-5" strokeWidth={2} />
        Filter Products
      </div>

      <div className="shop-filter-content">
        <div className="shop-filter-section">
          <div className="shop-filter-group">
            <label className="shop-filter-label">
              <span className="shop-label-icon">🏷️</span>
              Category
            </label>
            <Select value={filters.category} onValueChange={(value) => onFilterChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
                <br></br>
        <div className="shop-filter-divider"></div>

        {/* Sale Filter */}
        <div className="shop-filter-section">
          <div className="shop-filter-group">
            <label className="shop-filter-label">
              <span className="shop-label-icon">🔥</span>
              Sale Items
            </label>
            <Select value={filters.sale || "all"} onValueChange={(value) => onFilterChange("sale", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="true">On Sale Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
                <br></br>
        <div className="shop-filter-divider"></div>

        <div className="shop-filter-section">
          <div className="shop-filter-group">
            <label className="shop-filter-label">
              <span className="shop-label-icon">💰</span>
              Price Range (PKR)
            </label>
            <div className="shop-price-inputs">
              <div className="shop-price-input-wrapper">
                <input
                  type="number"
                  min="0"
                  max={priceInputs.max || ""}
                  maxLength="11"
                  value={priceInputs.min}
                  onChange={(e) => onPriceInputChange("min", e.target.value.slice(0, 11))}
                  className="shop-input shop-price-input"
                  placeholder="Min"
                />
                <span className="shop-price-label">Min</span>
              </div>
              <span className="shop-price-separator">–</span>
              <div className="shop-price-input-wrapper">
                <input
                  type="number"
                  min={priceInputs.min || ""}
                  max="10000"
                  maxLength="11"
                  value={priceInputs.max}
                  onChange={(e) => onPriceInputChange("max", e.target.value.slice(0, 11))}
                  className="shop-input shop-price-input"
                  placeholder="Max"
                />
                <span className="shop-price-label">Max</span>
              </div>
            </div>
            <div className="shop-price-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onApplyPrice(priceInputs.min, priceInputs.max)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
                  <br></br>
        <button onClick={onClearFilters} className="shop-clear-filters">Clear All Filters</button>
      </div>
    </div>
  );
}

export default function Shop() {
  const products = useSelector((state) => state.products.items);
  const categories = useSelector((state) => state.categories.items);
  const dispatch = useDispatch();
  const itemsPerLoad = 20;
  const [loadedCount, setLoadedCount] = useState(1);
  const loaderRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [priceInputs, setPriceInputs] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "All",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    search: searchParams.get("search") || "",
    fabric: searchParams.get("fabric") || "",
    occasion: searchParams.get("occasion") || "",
    sale: searchParams.get("sale") || "",
  });

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === "All") newParams.delete(key);
    else newParams.set(key, value);
    setSearchParams(newParams);
  };

  const applyPriceFilter = (nextMin, nextMax) => {
    const toNumberOrNull = (value) => {
      if (value === "" || value === null || value === undefined) return null;
      const numeric = Number(value);
      return Number.isNaN(numeric) ? null : numeric;
    };

    let minVal = toNumberOrNull(nextMin);
    let maxVal = toNumberOrNull(nextMax);

    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      const temp = minVal;
      minVal = maxVal;
      maxVal = temp;
    }

    setPriceInputs({
      min: minVal === null ? "" : String(minVal),
      max: maxVal === null ? "" : String(maxVal),
    });

    const newParams = new URLSearchParams(searchParams);
    if (minVal === null) newParams.delete("minPrice");
    else newParams.set("minPrice", String(minVal));
    if (maxVal === null) newParams.delete("maxPrice");
    else newParams.set("maxPrice", String(maxVal));
    setSearchParams(newParams);
  };

  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || "All",
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
      search: searchParams.get("search") || "",
      fabric: searchParams.get("fabric") || "",
      occasion: searchParams.get("occasion") || "",
      sale: searchParams.get("sale") || "",
    });
    setPriceInputs({
      min: searchParams.get("minPrice") || "",
      max: searchParams.get("maxPrice") || "",
    });
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = filters.category === "All" || product.category === filters.category;
      const matchFabric = !filters.fabric || product.description?.specifications?.toLowerCase().includes(filters.fabric.toLowerCase());
      const matchOccasion = !filters.occasion || product.tags?.includes(filters.occasion) || product.description?.specifications?.toLowerCase().includes(filters.occasion.toLowerCase());
      const matchPrice =
        (filters.minPrice === null || product.price >= filters.minPrice) &&
        (filters.maxPrice === null || product.price <= filters.maxPrice);
      const matchSearch = product.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchSale = !filters.sale || (filters.sale === "true" && product.isOnSale);
      return matchCategory && matchPrice && matchSearch && matchFabric && matchOccasion && matchSale;
    });
  }, [products, filters]);

  useEffect(() => {
    const handleObserver = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && loadedCount * itemsPerLoad < filteredProducts.length) {
        setLoadedCount((prev) => prev + 1);
      }
    };
    const observer = new IntersectionObserver(handleObserver, { threshold: 1.0 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loadedCount, filteredProducts.length]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, loadedCount * itemsPerLoad);
  }, [filteredProducts, loadedCount]);

  useEffect(() => {
    setLoadedCount(1);
  }, [filters]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setMobileFiltersOpen(false);
  };

  const activeChips = [
    filters.category !== "All" ? `Category: ${filters.category}` : null,
    filters.fabric ? `Fabric: ${filters.fabric}` : null,
    filters.occasion ? `Occasion: ${filters.occasion}` : null,
    filters.search ? `Search: ${filters.search}` : null,
    filters.minPrice !== null || filters.maxPrice !== null
      ? `Price: ${filters.minPrice ?? "Min"}-${filters.maxPrice ?? "Max"}`
      : null,
  ].filter(Boolean);

  const getQty = (id) => quantities[id] ?? 1;
  const updateQty = (id, delta, stockQuantity = 99) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const maxQty = Math.min(99, stockQuantity || 99);
      const next = Math.min(maxQty, Math.max(1, current + delta));
      return { ...prev, [id]: next };
    });
  };
  const handlePriceInputChange = (key, value) => {
    setPriceInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-search-bar">
          <MagnifyingGlassIcon className="w-5 h-5" />
          <input
            className="shop-search-input"
            placeholder="Search for a suit, fabric, or occasion"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div className="shop-toolbar">
          <span className="shop-count">{filteredProducts.length} items</span>
          <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="shop-filter-toggle">
            {mobileFiltersOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Filter className="w-4 h-4" />
            )}
            {mobileFiltersOpen ? "Close" : "Filters"}
          </button>
        </div>

        {mobileFiltersOpen && (
          <div className="shop-filter-dropdown">
            <FilterPanel
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              priceInputs={priceInputs}
              onPriceInputChange={handlePriceInputChange}
              onApplyPrice={applyPriceFilter}
              onClearFilters={clearFilters}
            />
          </div>
        )}

        {activeChips.length > 0 && (
          <div className="shop-chips">
            {activeChips.map((chip) => (
              <span key={chip} className="shop-chip">{chip}</span>
            ))}
            <button type="button" onClick={clearFilters} className="shop-chip">Clear</button>
          </div>
        )}

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <FilterPanel
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              priceInputs={priceInputs}
              onPriceInputChange={handlePriceInputChange}
              onApplyPrice={applyPriceFilter}
              onClearFilters={clearFilters}
            />
          </aside>

          <div>
            {visibleProducts.length === 0 ? (
              <div className="shop-empty">
                <p>No products found matching your filters.</p>
              </div>
            ) : (
              <div className="shop-grid">
                {visibleProducts.map((product) => (
                  <a key={product._id} href={`/show-product/${product._id}`} className="shop-card">
                    <div className="shop-card-media">
                      {product.isOnSale && (
                        <div className="shop-card-sale-badge">
                          <span className="shop-sale-badge-text">{product.salePercentage}% OFF</span>
                        </div>
                      )}
                      <img
                        src={product.images?.[0]?.url || product.image || "/fallback-image.jpg"}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="shop-card-body">
                      <div>
                        <div className="shop-card-title line-clamp-2">{product.name}</div>
                        <StarRatingDisplay rating={product.averageRating} count={product.reviewCount} />
                        <div className="shop-card-stock">
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
                      <div className="shop-card-price">
                        {product.isOnSale ? (
                          <>
                            <span className="shop-card-price-original">PKR {Math.round(product.price).toLocaleString()}</span>
                            <span className="shop-card-price-sale">PKR {Math.round(product.price - (product.price * product.salePercentage / 100)).toLocaleString()}</span>
                          </>
                        ) : (
                          <span>PKR {Math.round(product.price).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="shop-card-actions">
                        <div className="shop-qty">
                          <button
                            type="button"
                            className="shop-qty-btn"
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
                          <span className="shop-qty-value">{getQty(product._id)}</span>
                          <button
                            type="button"
                            className="shop-qty-btn"
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
                          className="btn btn-primary"
                          disabled={product.stockQuantity === 0}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dispatch(addToCart({
                              _id: product._id,
                              name: product.name,
                              price: product.price,
                              images: product.images,
                              isOnSale: product.isOnSale,
                              salePercentage: product.salePercentage,
                              qty: getQty(product._id),
                            }));
                          }}
                        >
                          {product.stockQuantity > 0 ? "Add to cart" : "Out of Stock"}
                        </button>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {visibleProducts.length < filteredProducts.length && (
              <div ref={loaderRef} style={{ padding: "32px 0", textAlign: "center", color: "var(--muted)" }}>
                Loading more products...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
