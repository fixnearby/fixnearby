// frontend/src/components/LandingPage/HeroSection.jsx
import React from 'react';

const HeroSection = () => {
  return (
    <section
      className="relative h-[600px] md:h-[700px] flex items-center justify-center text-center text-white overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>

      <div className="relative z-10 p-4">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-down">
          Your Home,<br/> Our Expertise
        </h1>
      </div>
    </section>
  );
};

export default HeroSection;