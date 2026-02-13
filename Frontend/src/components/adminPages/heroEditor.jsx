import axios from "axios";
import { Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import "./admin.css";

const url = import.meta.env.VITE_BACKEND_URL;
const heroID = "698f9454cebbb893e09d96e1";

const HeroEditor = () => {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const res = await axios.get(`${url}/user/api/v1/getHeroData/${heroID}`, {
        withCredentials: true,
      });
      if (res.data.hero) {
        setImages(res.data.hero.images || []);
        setTitle(res.data.hero.title || "");
        setSubtitle(res.data.hero.subTitle || "");
      }
    } catch {
      setError("Failed to fetch hero data.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || images.length >= 5) return;
    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await axios.post(
        `${url}/admin/api/v1/uploadHeroImage/${heroID}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setImages((prev) => [...prev, res.data.image]);
      setSuccess("Image uploaded successfully");
      setError("");
    } catch {
      setError("Upload failed");
      setSuccess("");
    } finally {
      setUploading(false);
      window.location.reload();
    }
  };

  const handleDelete = async (publicId) => {
    try {
      const res = await axios.put(
        `${url}/admin/api/v1/DeleteHeroImage`,
        { publicId },
        { withCredentials: true }
      );
      if (res.data.success) {
        setImages(images.filter((img) => img.publicId !== publicId));
        setSuccess("Image deleted");
        setError("");
      }
    } catch {
      setError("Failed to delete image");
      setSuccess("");
    }
  };

  const handleSaveText = async () => {
    try {
      await axios.put(
        `${url}/admin/api/v1/uploadHerotext/${heroID}`,
        { title, subtitle },
        { withCredentials: true }
      );
      setSuccess("Hero text updated");
      setError("");
      window.location.reload();
    } catch {
      setError("Failed to update text");
      setSuccess("");
    }
  };

  return (
    <div className="admin-page hero-editor-page">
      <div className="admin-page-header hero-editor-header">
        <div>
          <h2 className="admin-page-title">Hero Section Editor</h2>
          <p className="admin-page-subtitle">
            Manage hero images and update the headline content.
          </p>
        </div>
        <div className="hero-editor-count">{images.length}/5 images</div>
      </div>

      <div className="hero-editor-grid">
        <section className="hero-editor-card">
          <div className="hero-editor-card-header">
            <div>
              <h3 className="hero-editor-card-title">Hero Images</h3>
              <p className="hero-editor-card-sub">
                Upload up to 5 images. First image appears on load.
              </p>
            </div>
            <span className="hero-editor-chip">{images.length} / 5</span>
          </div>

          <div className="hero-editor-images-grid">
            {images.map((img) => (
              <div key={img?.publicId} className="hero-editor-image-item">
                <img src={img?.url} alt="hero" loading="lazy" />
                <button
                  onClick={() => handleDelete(img?.publicId)}
                  className="hero-editor-delete"
                  aria-label="Delete image"
                  title="Delete image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className={`hero-editor-upload ${uploading ? "is-loading" : ""}`}>
                <Upload size={22} />
                <span>{uploading ? "Uploading..." : "Upload Image"}</span>
                <span className="hero-editor-upload-hint">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </section>

        <section className="hero-editor-card">
          <div className="hero-editor-card-header">
            <div>
              <h3 className="hero-editor-card-title">Hero Text</h3>
              <p className="hero-editor-card-sub">
                Keep it short and bold. This appears above the fold.
              </p>
            </div>
          </div>

          <div className="admin-form-body">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="hero-title">
                Title
              </label>
              <input
                id="hero-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hero Title"
                className="admin-form-input"
              />
              <p className="admin-form-hint">Max 80 characters for best layout.</p>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="hero-subtitle">
                Subtitle
              </label>
              <textarea
                id="hero-subtitle"
                rows={5}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Hero Subtitle"
                className="admin-form-textarea"
              />
              <p className="admin-form-hint">Aim for 1-2 sentences.</p>
            </div>

            <button
              onClick={handleSaveText}
              className="admin-form-submit"
              disabled={uploading}
            >
              Save Hero Text
            </button>
          </div>
        </section>
      </div>

      {(error || success) && (
        <div
          className={`hero-editor-alert ${error ? "is-error" : "is-success"}`}
          role="alert"
        >
          {error || success}
        </div>
      )}
    </div>
  );
};

export default HeroEditor;
