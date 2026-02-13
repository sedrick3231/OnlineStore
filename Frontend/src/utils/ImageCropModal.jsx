import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";
import getCroppedImg from "./GetCroppedImg";
import "../components/adminPages/admin.css";

export default function ImageCropModal({
  imageSrc,
  onComplete,
  onCancel,
  aspect = 3 / 4,
  title = "Crop & Upload Image",
  subtitle = "",
  targetWidth = null,
  targetHeight = null,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const effectiveSubtitle = subtitle ||
    (targetWidth && targetHeight
      ? `Portrait format (${targetWidth}x${targetHeight}px) - Adjust position and zoom for best fit`
      : "Adjust position and zoom for best fit");

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    
    setProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        "dataURL",
        targetWidth,
        targetHeight
      );
      onComplete(croppedImage);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Failed to crop image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <div>
            <h2 className="crop-modal-title">{title}</h2>
            <p className="crop-modal-subtitle">{effectiveSubtitle}</p>
          </div>
          <button
            type="button"
            className="crop-modal-close"
            onClick={handleCancel}
            aria-label="Close"
            disabled={processing}
          >
            <X size={20} />
          </button>
        </div>

        <div className="crop-modal-body">
          <div className="crop-main-area">
            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={true}
                cropShape="rect"
              />
            </div>

            <div className="crop-controls">
              <div className="crop-zoom-control">
                <ZoomOut size={16} />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="crop-zoom-slider"
                  aria-label="Zoom level"
                />
                <ZoomIn size={16} />
              </div>
              <p className="crop-hint">Drag to reposition</p>
            </div>
          </div>

          <div className="crop-action-note">
            <Check size={16} style={{ color: "var(--accent)" }} />
            <span>Click <strong>Done</strong> to crop and upload this image</span>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button
            type="button"
            className="crop-cancel-btn"
            onClick={handleCancel}
            disabled={processing}
          >
            <X size={16} />
            <span>Cancel - Don't Upload</span>
          </button>
          <button
            type="button"
            className="crop-save-btn"
            onClick={handleDone}
            disabled={processing}
          >
            <Check size={18} />
            <span>{processing ? "Uploading..." : "Done - Upload Image"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
