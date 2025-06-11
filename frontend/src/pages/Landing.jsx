// frontend/src/pages/Landing.jsx
import React, { useState } from 'react';


import Header from '../components/LandingPage/Header.jsx';
import HeroSection from '../components/LandingPage/HeroSection.jsx';
import ServicesSection from '../components/LandingPage/ServicesSection.jsx';
import HowItWorksSection from '../components/LandingPage/HowItWorksSection.jsx';
import StatsSection from '../components/LandingPage/StatsSection.jsx';
import TestimonialsSection from '../components/LandingPage/TestimonialsSection.jsx';
import CtaSection from '../components/LandingPage/CtaSection.jsx';
import Footer from '../components/LandingPage/Footer.jsx';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
    {
      icon: null, 
      title: "Electrical Services",
      description: "Professional electrical repairs, installations, and maintenance",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: null,
      title: "Plumbing",
      description: "Complete plumbing solutions for all your water-related needs",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: null,
      title: "Carpentry",
      description: "Custom woodwork, furniture repair, and construction services",
      color: "from-amber-400 to-yellow-600"
    },
    {
      icon: null,
      title: "Painting",
      description: "Interior and exterior painting with premium quality finishes",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: null,
      title: "HVAC Services",
      description: "Heating, ventilation, and air conditioning repair & installation",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: null,
      title: "Home Security",
      description: "Security system installation and smart home automation",
      color: "from-red-400 to-rose-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Downtown",
      rating: 5,
      comment: "Incredible service! Fixed my electrical issue in no time. Highly professional and affordable."
    },
    {
      name: "Mike Chen",
      location: "Suburbs",
      rating: 5,
      comment: "The plumber arrived quickly and solved a complex leak problem. Will definitely use again!"
    },
    {
      name: "Emma Davis",
      location: "City Center",
      rating: 5,
      comment: "Amazing carpentry work on my kitchen cabinets. Exceeded all expectations!"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "500+", label: "Expert Technicians" },
    { number: "24/7", label: "Support Available" },
    { number: "99%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main>
        <HeroSection services={services} stats={stats} />
        <ServicesSection services={services} />
        <HowItWorksSection /> {/* This component has its own internal data */}
        <StatsSection stats={stats} />
        <TestimonialsSection testimonials={testimonials} />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;