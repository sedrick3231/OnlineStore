import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

export default function StarRatingDisplay({ rating = 0, count = 0 }) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="star-filled" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="star-filled" />);
    } else {
      stars.push(<FaRegStar key={i} className="star-empty" />);
    }
  }

  return (
    <div className="rating-stars">
      {stars}
      {count > 0 && (
        <span className="rating-count">({count})</span>
      )}
    </div>
  );
}
