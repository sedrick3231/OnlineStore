import axios from "axios";
import { useMemo, useState } from "react";
import EditReview from "./EditReview";
import StarRatingDisplay from "./StarRatingDisplay";

const url = import.meta.env.VITE_BACKEND_URL;

export default function ReviewList({ product, reviews = [], currentUserId }) {
  const [visibleCount, setVisibleCount] = useState(2);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  const ratingBreakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      const rating = Math.min(5, Math.max(1, Math.round(review.rating || 0)));
      counts[rating - 1] += 1;
    });
    return counts.reverse();
  }, [reviews]);

  const currentUserReviews = useMemo(() => {
    if (!currentUserId) return [];
    return reviews.filter((review) => review.userId === currentUserId);
  }, [reviews, currentUserId]);

  const otherReviews = useMemo(() => {
    if (!currentUserId) return reviews;
    return reviews.filter((review) => review.userId !== currentUserId);
  }, [reviews, currentUserId]);

  const visibleReviews = otherReviews.slice(0, visibleCount);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 7);
  const handleClose = () => setVisibleCount(2);

  const handleEditClick = (reviewId) => {
    setEditingReviewId((prev) => (prev === reviewId ? null : reviewId));
  };

  const handleDelete = async (reviewId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirm) return;
    await axios.delete(
      `${url}/products/api/Deletereview/${currentUserId}/${product._id}/${reviewId}`,
      { withCredentials: true }
    );
    // Ideally refresh reviews after deletion
  };

  return (
    <div className="review-list">
      <div className="review-header">
        <div>
          <h3 className="review-title">Customer Reviews</h3>
          <p className="review-subtitle">Verified ratings and comments from real buyers.</p>
        </div>
      </div>

      <div className="review-summary-card">
        <div className="review-summary-main">
          <div className="review-summary-score">{averageRating.toFixed(1)}</div>
          <div className="review-summary-stars">
            <StarRatingDisplay rating={averageRating} count={reviews.length} />
          </div>
          <div className="review-summary-note">Based on {reviews.length} reviews</div>
        </div>
        <div className="review-breakdown">
          {ratingBreakdown.map((count, index) => {
            const stars = 5 - index;
            const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={stars} className="review-breakdown-row">
                <span className="review-breakdown-label">{stars} star</span>
                <div className="review-breakdown-bar">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <span className="review-breakdown-value">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="review-empty">No reviews yet.</p>
      ) : (
        <>
          {currentUserReviews.length > 0 && (
            <div className="review-section">
              <h4 className="review-section-title">Your Review</h4>
              <div className="review-grid">
                {currentUserReviews.map((review, index) => (
                  <article
                    key={review._id || index}
                    className="review-card review-card--own"
                    role="region"
                    aria-labelledby={`review-${review._id}-author`}
                  >
                    <header className="review-card-header">
                      <div id={`review-${review._id}-author`} className="review-user">
                        <img
                          src={review.userImage}
                          alt={review.name || "User avatar"}
                          className="review-avatar"
                          loading="lazy"
                        />
                        <div>
                          <div className="review-name">{review.name || "You"}</div>
                          {review.date && (
                            <time
                              className="review-date"
                              dateTime={new Date(review.date).toISOString()}
                            >
                              {new Date(review.date).toLocaleDateString()}
                            </time>
                          )}
                        </div>
                      </div>
                      <div className="review-stars" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                        <StarRatingDisplay rating={review.rating} />
                      </div>
                    </header>

                    <p className="review-comment">{review.comment}</p>

                    <nav className="review-actions" aria-label="Review actions">
                      <button
                        onClick={() => handleEditClick(review._id)}
                        className="review-action"
                      >
                        {editingReviewId === review._id ? "Cancel" : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="review-action review-action--danger"
                      >
                        Delete
                      </button>
                    </nav>

                    {editingReviewId === review._id && (
                      <section className="review-edit">
                        <EditReview
                          userId={currentUserId}
                          review={review}
                          onClose={() => setEditingReviewId(null)}
                        />
                      </section>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="review-section">
            <h4 className="review-section-title">Customer Reviews</h4>
            {visibleReviews.length === 0 ? (
              <p className="review-empty">No other reviews yet.</p>
            ) : (
              <div className="review-grid">
                {visibleReviews.map((review, index) => (
                  <article
                    key={review._id || index}
                    className="review-card"
                    role="region"
                    aria-labelledby={`review-${review._id}-author`}
                  >
                    <header className="review-card-header">
                      <div id={`review-${review._id}-author`} className="review-user">
                        <img
                          src={review.userImage}
                          alt={review.name || "User avatar"}
                          className="review-avatar"
                          loading="lazy"
                        />
                        <div>
                          <div className="review-name">{review.name || "Anonymous"}</div>
                          {review.date && (
                            <time
                              className="review-date"
                              dateTime={new Date(review.date).toISOString()}
                            >
                              {new Date(review.date).toLocaleDateString()}
                            </time>
                          )}
                        </div>
                      </div>
                      <div className="review-stars" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                        <StarRatingDisplay rating={review.rating} />
                      </div>
                    </header>

                    <p className="review-comment">{review.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {(visibleCount < otherReviews.length || visibleCount > 1) && (
        <div className="review-controls">
          {visibleCount > 2 && (
            <button onClick={handleClose} className="review-control">
              Close
            </button>
          )}
          {visibleCount < otherReviews.length && (
            <button onClick={handleLoadMore} className="review-control review-control--primary">
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
