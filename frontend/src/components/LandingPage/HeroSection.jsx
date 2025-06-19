import React from "react";
import images from "../../assets/images.js";

const HeroSection = () => {
  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center text-center text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${images.hero})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

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

        .delay-[200ms] {
          animation-delay: 0.2s;
        }

        .delay-[600ms] {
          animation-delay: 0.6s;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
