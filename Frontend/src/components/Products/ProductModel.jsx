import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ProductDetails from "./ProductDetail";
import { useEffect } from "react";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useSelector((state) => state.products.items);
  const product = products.find((product) => product._id === id);

  const handleClose = () => navigate(-1);

  useEffect(() => {}, [product]);

  if (!product) return null;

  return (
      <ProductDetails product={product} />
  );
}
