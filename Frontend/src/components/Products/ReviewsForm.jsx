import axios from "axios";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProducts } from "../../redux/productSlicer";

const url = import.meta.env.VITE_BACKEND_URL;

export default function ReviewForm({ userId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const productId = useParams().id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setError("Please provide a rating and a comment.");
      return;
    }
    try {
      await axios.post(
        `${url}/products/api/review/${userId}/${productId}`,
        { rating, comment },
        { withCredentials: true }
      );
      setError("");
      dispatch(fetchProducts());
      setRating(0);
      setComment("");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="review-form"
    >
      <div className="review-form-header">
        <div>
          <h3 className="review-form-title">Leave a Review</h3>
          <p className="review-form-subtitle">Share what you liked or what could be better.</p>
        </div>
      </div>

      <div className="review-form-stars">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hover || rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className="review-form-star-btn"
            >
              <FaStar
                className={isActive ? "review-star-active" : "review-star-muted"}
              />
            </button>
          );
        })}
      </div>

      <textarea
        className="review-form-textarea"
        rows={4}
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {error && <p className="review-form-error">{error}</p>}

      <div className="review-form-footer">
        <button
          type="submit"
          disabled={!rating || !comment.trim()}
          className="review-form-submit"
        >
          Submit Review
        </button>
      </div>
    </form>
  );
}
