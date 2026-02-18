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
        {Component && <Component product={product} />}
    </div>
  );
}