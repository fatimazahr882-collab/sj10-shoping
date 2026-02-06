// src/components/StarRating.tsx
type Props = {
  rating?: number | null;
  reviewCount?: number | null;
};

export default function StarRating({ rating = 0, reviewCount }: Props) {
  const avgRating = parseFloat(String(rating)) || 0;
  if (avgRating === 0) return null; // Don't show stars if there's no rating

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= avgRating) stars.push(<i className="fas fa-star" key={i}></i>);
    else if (i - 0.5 <= avgRating) stars.push(<i className="fas fa-star-half-alt" key={i}></i>);
    else stars.push(<i className="far fa-star" key={i}></i>);
  }

  return (
    <div className="star-rating">
      {stars}
      {reviewCount != null && reviewCount > 0 && (
        <span className="review-count">({reviewCount})</span>
      )}
    </div>
  );
}