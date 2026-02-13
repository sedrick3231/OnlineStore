import "./home.css";

export default function NewsletterSignup() {
  return (
    <section className="home-section home-section--tint">
      <div className="container">
        <div className="newsletter-card">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <div className="section-eyebrow">Newsletter</div>
            <h2 className="section-title">Stay Updated</h2>
            <p className="section-subtitle">Subscribe for exclusive offers, new arrivals, and insider tips.</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className="newsletter-input" required />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
          <p className="section-subtitle" style={{ marginTop: 16 }}>We respect your privacy. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
