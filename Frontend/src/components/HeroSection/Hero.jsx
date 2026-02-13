import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const data = useSelector((state) => state.hero.data);
  const [images, setImages] = useState(data?.images || []);

  useEffect(() => {
    setImages(data?.images || []);
  }, [data]);

  // Auto-play carousel
  useEffect(() => {
    if (images.length === 0 || !isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, isAutoPlay]);

  const currentImage = images[current]?.url;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  const goToSlide = (index) => {
    setCurrent(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  return (
    <section
      className="hero"
      style={{
        minHeight: '90vh',
        paddingTop: 'var(--header-height)',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--surface)'
      }}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Animated gradient blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 8s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: 350,
          height: 350,
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 10s ease-in-out infinite reverse'
        }}></div>
      </div>


      {/* Background Images */}
      <div className="hero-bg-wrapper">
        {images.map((img, index) => (
          <div
            key={img._id || index}
            className={`hero-bg ${index === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img.url})` }}
          />
        ))}
      </div>


      {/* Enhanced gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(31,41,55,0.92) 0%, rgba(31,41,55,0.45) 45%, rgba(99,102,241,0.12) 100%)',
          zIndex: 1,
          backdropFilter: 'blur(0.5px)'
        }}
      />

      {/* Content Container */}
      <div style={{ position: 'relative', zIndex: 2 }} className="container inner">
        {/* Left Text Section */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
          {/* Main Heading */}
          <h1
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#ffffff',
              letterSpacing: -1,
              animation: 'slideInLeft 0.9s ease-out 0.1s backwards'
            }}
          >
            {data?.title || (
              <>
                Elevate Your{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, #6ee7b7 100%)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 900
                }}>
                  Elegance
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 520,
              animation: 'slideInLeft 1s ease-out 0.2s backwards'
            }}
          >
            {data?.subTitle || "Discover our exclusive collection of premium designer suits, featuring handcrafted details and finest fabrics. Experience luxury like never before."}
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              animation: 'slideInLeft 1.1s ease-out 0.3s backwards',
              flexWrap: 'wrap'
            }}
          >
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 32px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 14,
                font: 'inherit',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="btn btn-primary"
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(99,102,241,0.45)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(99,102,241,0.35)';
              }}
            >
              Shop Now
              <ChevronRight style={{ width: 20, height: 20, strokeWidth: 2.5 }} />
            </Link>

          </div>
        </div>

      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
          boxShadow: '0 -10px 30px rgba(99,102,241,0.3)',
          zIndex: 3
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(30px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 12px rgba(99,102,241,0.6);
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 24px rgba(99,102,241,0.4);
          }
        }

        .hero-bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;

  opacity: 0;
  transform: scale(1.04);
  transition: opacity 0.9s ease, transform 6s ease;
  will-change: opacity, transform;
}

.hero-bg.active {
  opacity: 1;
  transform: scale(1);
}

      `}</style>
    </section>
  );
}
