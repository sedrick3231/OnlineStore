import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Upload } from "lucide-react";
import { createCategoryAsync, deleteCategoryAsync, fetchCategories } from "../../redux/categorySlicer";
import ImageCropModal from "../../utils/ImageCropModal";
import "./admin.css";

const toId = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function CategoryManager() {
  const dispatch = useDispatch();
  const { items: categories, loading } = useSelector((state) => state.categories);
  const [name, setName] = useState("");
  const [imageData, setImageData] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState("");

  const previewName = useMemo(() => name.trim() || "New Category", [name]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setTempImageSrc(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  const handleCropComplete = (croppedImage) => {
    setImageData(croppedImage);
    setCropModalOpen(false);
    setTempImageSrc("");
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setTempImageSrc("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Category name is required.");
      setSuccess("");
      return;
    }

    const categoryData = {
      id: toId(trimmed),
      name: trimmed,
      image: imageData,
    };

    try {
      const token = localStorage.getItem("adminAccessToken");
      if (!token) {
        setError("Admin token is missing. Please login as admin.");
        setSuccess("");
        return;
      }

      await dispatch(createCategoryAsync(categoryData)).unwrap();
      setSuccess(`Category "${trimmed}" created successfully!`);
      
      setName("");
      setImageData("");
      setError("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err || "Failed to create category");
      setSuccess("");
    }
  };

  const handleDelete = async (id, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminAccessToken");
      if (!token) {
        setError("Admin token is missing. Please login as admin.");
        setSuccess("");
        return;
      }

      await dispatch(deleteCategoryAsync(id)).unwrap();
      setSuccess(`Category deleted successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err || "Failed to delete category");
    }
  };

  return (
    <>
      <div className="admin-page category-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Category Manager</h1>
            <p className="admin-page-subtitle">
              Create and manage categories used across the store
            </p>
          </div>
          <div className="admin-page-badge">{categories.length} Categories</div>
        </div>

      <div className="category-grid-layout">
        {/* Create Category Form */}
        <section className="category-card">
          <div className="category-card-header">
            <h2 className="category-card-title">
              <Upload size={20} />
              Create Category
            </h2>
          </div>

          <div className="category-card-body">
            <form className="category-form" onSubmit={handleCreate}>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="category-name">
                  Category Name <span className="admin-form-label-required">*</span>
                </label>
                <input
                  id="category-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Summer Collection"
                  className="admin-form-input"
                  autoComplete="off"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="category-image">
                  Category Image
                </label>
                <div className="category-upload">
                  <input
                    id="category-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="category-upload-icon">
                    <Upload size={24} />
                  </div>
                  <p className="category-upload-text">
                    {imageData ? "Change Image" : "Upload Image"}
                  </p>
                  <p className="category-upload-hint">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Preview</label>
                <div className="category-preview">
                  {imageData ? (
                    <img src={imageData} alt={previewName} />
                  ) : (
                    <div className="category-preview-placeholder">
                      <span style={{ fontSize: "48px", fontWeight: "800", color: "var(--accent)" }}>
                        {previewName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {error && <div className="category-alert is-error">{error}</div>}
              {success && <div className="category-alert is-success">{success}</div>}

              <button className="admin-form-submit" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>
        </section>

        {/* Existing Categories List */}
        <section className="category-card">
          <div className="category-card-header">
            <h2 className="category-card-title">
              <Trash2 size={20} />
              Manage Categories
            </h2>
          </div>

          <div className="category-card-body">
            {loading && categories.length === 0 ? (
              <div className="category-empty">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="category-empty">
                No categories yet. Create your first category to get started.
              </div>
            ) : (
              <div className="category-list">
                {categories.map((category) => (
                  <div key={category.id} className="category-item">
                    <div className="category-item-image">
                      {category.image ? (
                        <img src={category.image} alt={category.name} />
                      ) : (
                        <span className="category-item-fallback">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="category-item-info">
                      <p className="category-item-name">{category.name}</p>
                      <p className="category-item-id">{category.id}</p>
                    </div>
                    <button
                      type="button"
                      className="category-delete-btn"
                      onClick={() => handleDelete(category.id, category.name)}
                      aria-label={`Delete ${category.name}`}
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>

    {cropModalOpen && (
      <ImageCropModal
        imageSrc={tempImageSrc}
        onComplete={handleCropComplete}
        onCancel={handleCropCancel}
        aspect={3 / 4}
        targetWidth={360}
        targetHeight={480}
        subtitle="Portrait format (360x480px) - Adjust position and zoom for best fit"
      />
    )}
  </>
  );
}
