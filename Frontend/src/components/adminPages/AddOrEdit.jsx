import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import "./admin.css";

export default function AddOrEditModal({ Component }) {
  const { productId } = useParams();
  const products = useSelector((state) => state.products.items);
  const product = products.find((product) => product._id === productId);
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="admin-modal-wrapper">
      <div className="admin-modal-header-bar">
        <button
          onClick={handleClose}
          aria-label="Go back"
          className="admin-modal-back-btn"
        >
          <ArrowLeft className="admin-modal-back-icon" />
          <span>Go Back</span>
        </button>
      </div>

      <div className="admin-modal-content-wrapper">
        {Component && <Component product={product} />}
      </div>
    </div>
  );
}