import { memo } from "react";
import { useSelector } from "react-redux";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewsForm";


const RatingsSection = memo(function RatingsSection({product}) {
    const {user, isLoggedIn} = useSelector((state)=> state.user);
    const hasReviewed = !!product?.reviews?.some((review) => review.userId === user?._id);
  return (
    <div className="mb-6">
      <ReviewList
        product={product}
        reviews={product.reviews}
        currentUserId={user?._id ? user._id : null}
      />
      {!isLoggedIn && (
        <div className="review-login-note">
          Please log in to write a review.
        </div>
      )}
      {user && !hasReviewed && (
        <ReviewForm userId={user._id}/>
      )}
      {user && hasReviewed && (
        <div className="review-login-note">
          You have already reviewed this product. You can edit or delete your review above.
        </div>
      )}
    </div>
  );
});

export default RatingsSection;
