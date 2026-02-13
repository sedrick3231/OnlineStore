import { Quote, Star, MessageCircle } from "lucide-react";
import "./home.css";

export default function Testimonials() {
  const feedback = [
    {
      name: "Alice",
      quote: "Amazing quality and fast delivery! The designs are incredibly stunning and the fabric feels luxurious.",
      avatar: "https://i.pravatar.cc/100?img=1",
      rating: 5,
    },
    {
      name: "Jake",
      quote: "My go-to store for accessories. Customer service is exceptional and the products are top-notch.",
      avatar: "https://i.pravatar.cc/100?img=2",
      rating: 5,
    },
  ];

  return (
    <section className="home-section home-section--soft">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">
            <MessageCircle size={16} />
            Reviews
          </div>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real feedback from our valued customers.</p>
          <div className="section-divider" />
        </div>

        <div className="testimonial-grid">
          {feedback.map((f, i) => (
            <div key={i} className="testimonial-card">
              <div style={{ position: "absolute", top: -20, right: -10, opacity: 0.08 }}>
                <Quote size={84} />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[...Array(f.rating)].map((_, j) => (
                  <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="testimonial-quote">"{f.quote}"</p>
              <div className="testimonial-footer">
                <img src={f.avatar} alt={f.name} className="testimonial-avatar" />
                <div>
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Verified Customer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
