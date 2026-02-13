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
    <div className="min-h-screen bg-gradient-to-b from-[#f4f4f5] via-[#e8eaec] to-[#f4f4f5] dark:from-[#0b0b0c] dark:via-[#121215] dark:to-[#0b0b0c] p-6 sm:p-10 transition-colors duration-300">
      <div className="mb-6">
        <button
          onClick={handleClose}
          aria-label="Go back"
          className="inline-flex items-center gap-2 text-primary dark:text-accent bg-white dark:bg-neutral-900 hover:shadow-md transition-all duration-200 text-base sm:text-lg font-medium rounded-full px-4 py-2 shadow-sm border border-neutral-200 dark:border-neutral-700"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          Go Back
        </button>
      </div>

      <ProductDetails product={product} />
    </div>
  );
}
