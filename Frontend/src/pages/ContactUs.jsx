import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import "./contact.css";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // try{
    //   const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contact`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(formData),
    //   });
    //   if (!res.ok) {
    //     throw new Error("Failed to submit contact form");
    //   }
    // }catch(error){
    //   console.error("Error submitting contact form:", error);
    // }
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="contact-container">
      {/* Header */}
      <div className="contact-header">
        <h1>Get in Touch</h1>
        <p>
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      {/* Contact Cards & Form Grid */}
      <div className="contact-grid">
        {/* Contact Info Cards */}
        <div className="contact-info">
          {/* Email Card */}
          <div className="contact-card">
            <div className="contact-icon">
              <Mail strokeWidth={1.5} />
            </div>
            <div className="contact-details">
              <h3 className="contact-label">Email</h3>
              <p className="contact-value">lamsbyrs@gmail.com</p>
              <p className="contact-meta">We reply within 24 hours</p>
            </div>
          </div>

          {/* Phone Card */}
          <div className="contact-card">
            <div className="contact-icon">
              <Phone strokeWidth={1.5} />
            </div>
            <div className="contact-details">
              <h3 className="contact-label">Phone</h3>
              <p className="contact-value">+92 (301) 910 1777</p>
              <p className="contact-meta">Monday to Friday, 9AM-6PM</p>
            </div>
          </div>

          {/* Address Card */}
          <div className="contact-card">
            <div className="contact-icon">
              <MapPin strokeWidth={1.5} />
            </div>
            <div className="contact-details">
              <h3 className="contact-label">Address</h3>
              <p className="contact-value">LAMS Headquarters</p>
              <p className="contact-meta">Lahore, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-section">
          {submitted ? (
            <div className="success-banner">
              <CheckCircle strokeWidth={1.5} />
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>Thank you!</h3>
                <p className="success-text">
                  We've received your message and will get back to you soon.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <h2 className="contact-form-title">Send us a Message</h2>

              {/* Name & Email Row */}
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Phone & Subject Row */}
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+92 (301) 910 1777"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="form-field form-row full">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Tell us more about your inquiry..."
                  className="form-textarea"
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-send">
                <Send strokeWidth={1.5} />
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="contact-faq-section">
        <h2 className="contact-faq-title">Frequently Asked Questions</h2>
        <div className="contact-faq-grid">
          {[
            {
              q: "What's your return policy?",
              a: "We offer 30-day returns on all items in original condition with tags attached.",
            },
            {
              q: "How long does shipping take?",
              a: "Standard shipping takes 5-7 business days. Express shipping available.",
            },
            {
              q: "Do you ship internationally?",
              a: "Currently, we ship within Pakistan. International shipping coming soon!",
            },
            {
              q: "How can I track my order?",
              a: "You'll receive a tracking link via email once your order ships.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="contact-faq-card">
              <h3 className="contact-faq-question">{faq.q}</h3>
              <p className="contact-faq-answer">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}