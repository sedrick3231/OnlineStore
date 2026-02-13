import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Grid3x3 } from "lucide-react";
import "./home.css";

export default function Categories() {
  const navigate = useNavigate();
  const categories = useSelector((state) => state.categories.items);
  const categoriesWithAll = [
    ...categories,
  ];

  const handleCategoryClick = (category) => {
    const params = new URLSearchParams();
    if (category !== "All") {
      params.set("category", category);
    }

    // 🔥 This forces a *new* history entry, even on same path
    navigate(`/shop?${params.toString()}`);
  };

  return (
    <section className="home-section home-section--soft">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">
            <Grid3x3 size={16} />
            Collections
          </div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Browse our curated collections of premium designer suits.</p>
          <div className="section-divider" />
        </div>

        <div className="category-grid">
          {categoriesWithAll.map((cat) => (
            <button
              key={cat.id}
              className="category-card"
              onClick={() => handleCategoryClick(cat.name)}
              aria-label={`Browse ${cat.name} category`}
            >
              <div className="category-media" aria-hidden="true">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} />
                ) : (
                  <span>{cat.name.charAt(0)}</span>
                )}
              </div>
              <div className="category-name">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
