import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ImageCropModal from "@/utils/ImageCropModal";

const url = import.meta.env.VITE_BACKEND_URL;

export default function ProductCreateForm() {
  const categories = useSelector((state) => state.categories.items);
  const [images, setImages] = useState([]);
  const [cropQueue, setCropQueue] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState("");
  const remainingSlots = Math.max(0, 3 - images.length - cropQueue.length);
  const isCropping = cropModalOpen || cropQueue.length > 0;

  const [form, setForm] = useState({
    name: "",
    description: {
      feature: "",
      specifications: "",
    },
    price: "",
    category: "",
    stockQuantity: "",
    popular: false,
  });

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

  useEffect(() => {
    if (!form.category && categories.length > 0) {
      setForm((prev) => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, form.category]);

  const dataUrlToFile = async (dataUrl, fileName, fileType) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: fileType || blob.type });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 3 - images.length - cropQueue.length;
    if (remainingSlots <= 0) {
      alert("You can only upload up to 3 images.");
      return;
    }

    const acceptedFiles = files.slice(0, remainingSlots);
    if (acceptedFiles.length < files.length) {
      alert("You can only upload up to 3 images.");
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

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle simple input changes (name, price, category, stockQuantity)
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Handle nested description changes
  function handleDescriptionChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      description: { ...f.description, [name]: value },
    }));
  }

  // Basic validation
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
    if (!images.length) newErrors.images = "At least one image is required";

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
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("stockQuantity", form.stockQuantity);
      formData.append(
        "description",
        JSON.stringify({
          feature: form.description.feature,
          specifications: form.description.specifications,
        })
      );

      formData.append("popular", form.popular);

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const res = await axios.post(`${url}/products/addProduct/`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Optional: reset form after success
      setForm({
        name: "",
        description: { feature: "", specifications: "" },
        price: "",
        category: categories[0]?.name || "",
        stockQuantity: "",
        popular: false,
      });

      setImages([]);
      setCropQueue([]);
      setErrors({});
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload product. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-header">
        <h2 className="admin-form-title">Create New Product</h2>
        <p className="admin-form-subtitle">Add a new product to your store inventory</p>
      </div>

      <div className="admin-form-body">
        {/* Name */}
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
            autoComplete="off"
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
            placeholder="Describe key features of the product"
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
            onValueChange={(value) => setForm(f => ({ ...f, category: value }))}
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

        {/* Popular Checkbox */}
        <div className="admin-form-checkbox-wrapper">
          <input
            type="checkbox"
            id="popular"
            name="popular"
            checked={form.popular}
            onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))}
            className="admin-form-checkbox"
          />
          <label htmlFor="popular" className="admin-form-checkbox-label">
            Mark as Featured Product
          </label>
        </div>

        {/* Images Upload */}
        <div className="admin-form-group">
          <label htmlFor="images" className="admin-form-label">
            Product Images (Max 3) <span className="admin-form-label-required">*</span>
          </label>
          <div className="admin-form-images-upload">
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={images.length + cropQueue.length >= 3}
            />
            <p className="admin-form-hint">
              Upload up to 3 high-quality images of your product ({images.length}/3)
            </p>
            {isCropping && (
              <p className="admin-form-hint">Cropping in progress...</p>
            )}
            {!isCropping && remainingSlots === 0 && (
              <p className="admin-form-hint">Maximum image limit reached.</p>
            )}
          </div>
          {errors.images && (
            <p className="admin-form-error">{errors.images}</p>
          )}
          <div className="admin-form-images-preview">
            {images.map((img, idx) => (
              <div key={idx} className="admin-form-image-item">
                <img src={img.preview} alt={`preview-${idx}`} />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="admin-form-image-remove"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="admin-form-submit"
        >
          {uploading ? "Creating Product..." : "Create Product"}
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
