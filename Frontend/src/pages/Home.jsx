import { Suspense, lazy } from "react";
const SaleBanner = lazy(() => import("../components/home/SaleBanner"));
const Hero = lazy(() => import("../components/HeroSection/Hero"));
const BestSellers = lazy(() => import("../components/home/BestSellers"));
const Categories = lazy(() => import("../components/home/Categories"));
const NewsletterSignup = lazy(() => import("../components/home/NewsletterSignup"));
const PromoBanner = lazy(() => import("../components/home/PromoBanner"));
const Testimonials = lazy(() => import("../components/home/Testimonials"));

const Home = () => {
  return (
    <>
      <Suspense fallback={null}>
        <SaleBanner />
      </Suspense>
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
      <Suspense fallback={null}>
        <Categories />
      </Suspense>
      <Suspense fallback={null}>
        <BestSellers />
      </Suspense>
      <Suspense fallback={null}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={null}>
        <NewsletterSignup />
      </Suspense>
    </>
  );
};

export default Home