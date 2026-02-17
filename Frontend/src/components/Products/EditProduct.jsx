import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import ImageCropModal from "@/utils/ImageCropModal";

const url = import.meta.env.VITE_BACKEND_URL;

function EditProductForm({ product, onSubmit }) {
  const categories = useSelector((state) => state.categories.items);
  const [images, setImages] = useState([]); // New uploads: {file, preview}
  const [existingImages, setExistingImages] = useState(product.images);
  const [cropQueue, setCropQueue] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState("");
  const [form, setForm] = useState({
    name: product.name,
    description: {
      feature: product.description.feature,
      specifications: product.description.specifications,
    },
    price: product.price,
    category: product.category,
    stockQuantity: product.stockQuantity,
  });

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const [previewImage, setPreviewImage] = useState(
    product.images[0]?.url || null
  );

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  useEffect(() => {
    if (currentFile || cropQueue.length === 0) return;

    const nextFile = cropQueue[0];
    setCurrentFile(nextFile);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setTempImageSrc(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(nextFile);
  }, [cropQueue, currentFile]);

  const dataUrlToFile = async (dataUrl, fileName, fileType) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: fileType || blob.type });
  };

  const handleRemovePreviewImage = () => {
    // Remove from existingImages or images based on match
    const isExisting = existingImages.find((img) => img.url === previewImage);
    if (isExisting) {
      setExistingImages(
        existingImages.filter((img) => img.url !== previewImage)
      );
    } else {
      setImages(images.filter((img) => img.preview !== previewImage));
    }

    // Reset preview image
    const all = [...existingImages, ...images].filter((img) =>
      img.url ? img.url !== previewImage : img.preview !== previewImage
    );
    setPreviewImage(all[0]?.url || all[0]?.preview || null);
  };

  // Handle new image uploads
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 3 - images.length - existingImages.length - cropQueue.length;
    if (remainingSlots <= 0) {
      alert("You can only upload up to 3 images total.");
      return;
    }

    const acceptedFiles = files.slice(0, remainingSlots);
    if (acceptedFiles.length < files.length) {
      alert("You can only upload up to 3 images total.");
    }

    setCropQueue((prev) => [...prev, ...acceptedFiles]);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedImage) => {
    if (!currentFile) return;

    const croppedFile = await dataUrlToFile(
      croppedImage,
      currentFile.name,
      currentFile.type
    );

    setImages((prev) => [
      ...prev,
      {
        file: croppedFile,
        preview: croppedImage,
      },
    ]);

    if (!previewImage) {
      setPreviewImage(croppedImage);
    }

    setCropModalOpen(false);
    setTempImageSrc("");
    setCurrentFile(null);
    setCropQueue((prev) => prev.slice(1));
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setTempImageSrc("");
    setCurrentFile(null);
    setCropQueue((prev) => prev.slice(1));
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleDescriptionChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      description: { ...f.description, [name]: value },
    }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.description.feature.trim())
      newErrors.feature = "Feature description is required";
    if (!form.description.specifications.trim())
      newErrors.specifications = "Specifications are required";
    if (!form.price || isNaN(form.price) || Number(form.price) < 0)
      newErrors.price = "Price must be a positive number";
    if (
      !form.stockQuantity ||
      isNaN(form.stockQuantity) ||
      Number(form.stockQuantity) < 0
    )
      newErrors.stockQuantity = "Stock quantity must be a positive number";
    if (!form.category) newErrors.category = "Category is required";
    if (images.length + existingImages.length === 0)
      newErrors.images = "At least one image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", String(form.price));
      formData.append("stockQuantity", String(form.stockQuantity));
      formData.append("category", form.category);
      formData.append(
        "description",
        JSON.stringify({
          feature: form.description.feature,
          specifications: form.description.specifications,
        })
      );

      // Append new images
      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const retainedPublicIDs = existingImages.map((img) => img.publicID);
      // Append existing images info (to keep them on backend)
      formData.append("existingImgIds", retainedPublicIDs);
      formData.append("existingImages", JSON.stringify(existingImages));

      const res = await axios.put(
        `${url}/products/editProduct/${product._id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (onSubmit) onSubmit(res.data);
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-header">
        <h2 className="admin-form-title">Edit Product</h2>
        <p className="admin-form-subtitle">Update product information and details</p>
      </div>

      <div className="admin-form-body">
        <div className="admin-form-row" style={{gridTemplateColumns: "2fr 1fr", gap: "var(--space-xl)"}}>
          {/* Left Column - Form Fields */}
          <div style={{display: "flex", flexDirection: "column", gap: "var(--space-lg)"}}>
            {/* Product Name */}
            <div className="admin-form-group">
              <label htmlFor="name" className="admin-form-label">
                Product Name <span className="admin-form-label-required">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`admin-form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="admin-form-error">{errors.name}</p>
              )}
            </div>

            {/* Feature Description */}
            <div className="admin-form-group">
              <label htmlFor="feature" className="admin-form-label">
                Fabric & Details <span className="admin-form-label-required">*</span>
              </label>
              <textarea
                id="feature"
                name="feature"
                value={form.description.feature}
                onChange={handleDescriptionChange}
                className={`admin-form-textarea ${errors.feature ? 'error' : ''}`}
                placeholder="Describe the product features"
              />
              {errors.feature && (
                <p className="admin-form-error">{errors.feature}</p>
              )}
            </div>

            {/* Specifications */}
            <div className="admin-form-group">
              <label htmlFor="specifications" className="admin-form-label">
                Dupatta <span className="admin-form-label-required">*</span>
              </label>
              <textarea
                id="specifications"
                name="specifications"
                value={form.description.specifications}
                onChange={handleDescriptionChange}
                className={`admin-form-textarea ${errors.specifications ? 'error' : ''}`}
                placeholder="Enter product specifications"
              />
              {errors.specifications && (
                <p className="admin-form-error">{errors.specifications}</p>
              )}
            </div>

            {/* Price and Stock Row */}
            <div className="admin-form-row">
              {/* Price */}
              <div className="admin-form-group">
                <label htmlFor="price" className="admin-form-label">
                  Price (PKR) <span className="admin-form-label-required">*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  step="0.01"
                  maxLength="11"
                  value={form.price}
                  onChange={handleChange}
                  onInput={(e) => e.target.value = e.target.value.slice(0, 11)}
                  className={`admin-form-input ${errors.price ? 'error' : ''}`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="admin-form-error">{errors.price}</p>
                )}
              </div>

              {/* Stock Quantity */}
              <div className="admin-form-group">
                <label htmlFor="stockQuantity" className="admin-form-label">
                  Stock Quantity <span className="admin-form-label-required">*</span>
                </label>
                <input
                  id="stockQuantity"
                  type="number"
                  name="stockQuantity"
                  maxLength="11"
                  value={form.stockQuantity}
                  onChange={handleChange}
                  onInput={(e) => e.target.value = e.target.value.slice(0, 11)}
                  className={`admin-form-input ${errors.stockQuantity ? 'error' : ''}`}
                  placeholder="0"
                />
                {errors.stockQuantity && (
                  <p className="admin-form-error">{errors.stockQuantity}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                Category <span className="admin-form-label-required">*</span>
              </label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((f) => ({ ...f, category: value }))}
              >
                <SelectTrigger className={errors.category ? 'error' : ''}>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="admin-form-error">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Right Column - Image Preview */}
          <div style={{display: "flex", flexDirection: "column", gap: "var(--space-lg)"}}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                Product Images <span className="admin-form-label-required">*</span>
              </label>
              <p className="admin-form-hint">Click thumbnail to preview</p>
            </div>

            {/* Main Preview */}
            <div style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1",
              border: "1.5px solid var(--border-light)",
              borderRadius: "16px",
              overflow: "hidden",
              background: "rgba(26,95,90,0.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 300ms"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemovePreviewImage}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "var(--danger)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "700",
                      transition: "all 200ms",
                      boxShadow: "0 2px 8px rgba(239,68,68,0.3)"
                    }}
                    title="Remove this image"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <p style={{color: "var(--muted)", fontSize: "14px", fontWeight: "500"}}>
                  No image available
                </p>
              )}
            </div>

            {/* Thumbnails */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px"
            }}>
              {[...existingImages, ...images].map((img, idx) => {
                const src = img.url || img.preview;
                const isActive = src === previewImage;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewImage(src)}
                    style={{
                      aspectRatio: "1",
                      border: isActive ? "2px solid var(--accent)" : "1.5px solid var(--border-light)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 200ms",
                      background: "transparent"
                    }}
                  >
                    <img
                      src={src}
                      alt={`thumb-${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Upload Input */}
            <div className="admin-form-images-upload">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={images.length + existingImages.length + cropQueue.length >= 3}
              />
              <p className="admin-form-hint">
                Upload up to 3 images total
              </p>
            </div>
            {errors.images && (
              <p className="admin-form-error">{errors.images}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="admin-form-submit"
        >
          {uploading ? "Updating Product..." : "Update Product"}
        </button>
      </div>
    </form>

    {cropModalOpen && (
      <ImageCropModal
        imageSrc={tempImageSrc}
        onComplete={handleCropComplete}
        onCancel={handleCropCancel}
        aspect={1}
        title="Crop Product Image"
        subtitle="Square format - Adjust position and zoom for best fit"
      />
    )}
    </>
  );
}
export default EditProductForm;
