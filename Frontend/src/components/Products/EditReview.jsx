import axios from "axios";
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";

const url = import.meta.env.VITE_BACKEND_URL;

export default function EditReview({ userId, review, onClose = () => {} }) {
  const productId = useParams().id;
  const [rating, setRating] = useState(review?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(review?.comment || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
    }
  }, [review]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setError("Please provide a rating and a comment.");
      return;
    }
    try {
      await axios.put(
        `${url}/products/api/Updatereview/${userId}/${productId}/${review._id}`,
        { rating, comment },
        { withCredentials: true }
      );
      onClose();  //close the edit form
    } catch (err) {
        console.log(err)
      setError(err?.response?.data?.message || "Something went wrong.");
    } 
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="review-edit-form"
    >
      <h3 className="review-edit-title">
        Edit your Review
      </h3>

      <div className="review-edit-stars">
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
              className="review-edit-star-btn"
            >
              <FaStar
                className={isActive ? "review-star-active" : "review-star-muted"}
              />
            </button>
          );
        })}
      </div>

      <textarea
        className="review-edit-textarea"
        rows={4}
        placeholder="Share your updated experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {error && <p className="review-edit-error">{error}</p>}

      <div className="review-edit-actions">
        <button
          type="button"
          onClick={onClose}
          className="review-edit-btn review-edit-btn--secondary"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="review-edit-btn"
          disabled={!rating || !comment.trim()}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
