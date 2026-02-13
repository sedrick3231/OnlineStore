import { Button } from "@/components/ui/button";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import StarRatingDisplay from "../Products/StarRatingDisplay";
import "./admin.css";

const url = import.meta.env.VITE_BACKEND_URL;

export default function AdminReviewPage() {
  const { productId } = useParams();
  const products = useSelector((state) => state.products.items);
  const product = products.find((product) => product._id === productId);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReviews(product?.reviews);
    setLoading(false);
  }, [product]);

  const safeReviews = reviews || [];
  const averageRating = useMemo(() => {
    if (!safeReviews.length) return 0;
    const total = safeReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Math.round((total / safeReviews.length) * 10) / 10;
  }, [safeReviews]);

  const ratingBreakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    safeReviews.forEach((review) => {
      const rating = Math.min(5, Math.max(1, Math.round(review.rating || 0)));
      counts[rating - 1] += 1;
    });
    return counts.reverse();
  }, [safeReviews]);

  const handleDelete = async (reviewId, userId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirm) return;
    await axios.delete(
      `${url}/products/api/Deletereview/${userId}/${product._id}/${reviewId}`,
      { withCredentials: true }
    );
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
  };

  if (!product && loading) {
    return <p className="admin-review-loading">Loading reviews...</p>;
  }

  if (!product && !loading) {
    return <p className="admin-review-empty">Product not found.</p>;
  }

  return (
    <div className="admin-review-page">
      <div className="admin-review-header">
        <div>
          <p className="admin-review-kicker">Product reviews</p>
          <h2 className="admin-review-title">{product?.name}</h2>
        </div>
        <div className="admin-review-summary">
          <div className="admin-review-score">
            <div className="admin-review-score-value">{averageRating.toFixed(1)}</div>
            <StarRatingDisplay rating={averageRating} count={safeReviews.length} />
            <span className="admin-review-score-count">{safeReviews.length} total</span>
          </div>
          <div className="admin-review-breakdown">
            {ratingBreakdown.map((count, index) => {
              const stars = 5 - index;
              const percent = safeReviews.length ? Math.round((count / safeReviews.length) * 100) : 0;
              return (
                <div key={stars} className="admin-review-breakdown-row">
                  <span className="admin-review-breakdown-label">{stars} star</span>
                  <div className="admin-review-breakdown-bar">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <span className="admin-review-breakdown-value">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {safeReviews.length === 0 ? (
        <p className="admin-review-empty">No reviews found for this product.</p>
      ) : (
        <div className="admin-review-list">
          {safeReviews.map((review) => (
            <div key={review._id} className="admin-review-card">
              <div className="admin-review-card-header">
                <div className="admin-review-user">
                  <img
                    src={review.userImage || "/placeholder.png"}
                    alt={review.name || "User avatar"}
                    className="admin-review-avatar"
                  />
                  <div>
                    <div className="admin-review-name">{review.name || "Anonymous"}</div>
                    <div className="admin-review-date">
                      {review.date ? new Date(review.date).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
                <div className="admin-review-rating">
                  <StarRatingDisplay rating={review.rating} />
                </div>
              </div>
              <p className="admin-review-comment">{review.comment}</p>
              <div className="admin-review-actions">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(review._id, review.userId)}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}