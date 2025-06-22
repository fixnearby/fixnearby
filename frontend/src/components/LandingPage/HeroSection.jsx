import React from "react";

const HeroSection = () => {
  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center text-center text-white overflow-hidden">
      <picture>
       <img
  alt="Home service hero background"
  class="absolute inset-0 w-full h-full object-cover z-0"
  width="1920"
  height="1080"
  loading="eager"
  fetchpriority="high"
  src="/images/logos/hero.webp"
  srcset="/images/logos/hero-small.webp 480w,
          /images/logos/hero-medium.webp 800w,
          /images/logos/hero-large.webp 1200w,
          /images/logos/hero.webp 1920w"
  sizes="(max-width: 600px) 100vw,
         (max-width: 1024px) 100vw,
         100vw"
/>
      </picture>
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 p-4">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight space-y-4">
          <span className="block animate-fade-slide-in delay-[200ms]">
            Your Home,
          </span>
          <span className="block animate-fade-slide-in delay-[600ms]">
            Our Expertise
          </span>
        </h1>
      </div>

      <style>{`
        @keyframes fade-slide-in {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .animate-fade-slide-in {
          animation: fade-slide-in 1.3s ease-out forwards;
        }

        .delay-\\[200ms\\] {
          animation-delay: 0.2s;
        }

        .delay-\\[600ms\\] {
          animation-delay: 0.6s;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;