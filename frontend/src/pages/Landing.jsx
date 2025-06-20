// frontend/src/pages/Landing.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/LandingPage/Header.jsx';
import HeroSection from '../components/LandingPage/HeroSection.jsx';
import ServicesSection from '../components/LandingPage/ServicesSection.jsx';
import PopularServicesSection from '../components/LandingPage/PopularServicesSection.jsx';
import TestimonialsSection from '../components/LandingPage/TestimonialsSection.jsx'; 
import CtaSection from '../components/LandingPage/CtaSection.jsx'; 
import Footer from '../components/LandingPage/Footer.jsx';

import { Zap, Wrench, Paintbrush, Pipette, Home, Sprout } from 'lucide-react';
import images from '../assets/images.js';


const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
   {
      image: `${images.appliances}`, 
      title: "Appliances",
    },
   {
      image: `${images.electrical}`, 
      title: "Electrical",
    },
    {
      image: `${images.security}`, 
      title: "Security",
    },
    {
      image: `${images.gardening}`, 
      title: "Gardening",
    },
    {
      image: `${images.painting}`, 
      title: "Painting",
    },
    {
      image: `${images.pestcontrol}`, 
      title: "Pest Control",
    },
  ];

  const popularServices = [
    {
      image: `${images.pbIcon}`, 
      title: "Plumbing",
      description: "Fix leaky faucets, blocked drains, and more.",
      price: 499
    },
    {
      image: `${images.acIcon}`, 
      title: "AC Service",
      description: "Service and repair of all AC systems.",
      price: 599
    },
    {
      image: `${images.cleaningIcon}`,
      title: "Deep Cleaning",
      description: "Thorough cleaning of homes and offices.",
      price: 599
    }
  ];

  const testimonials = [
    {
      name: "Jatin Agrawal",
      rating: 4,
      review: "Ramesh did a great job and handled everything smoothly. Just a little more attention to detail would have made it perfect."
    },
    {
      name: "Swarnim Agrawal",
      rating: 5,
      review: "Absolutely satisfied with the service! Quick, professional, and friendly throughout the entire process."
    },
    {
      name: "Bhuvan Sharma",
      rating: 4,
      review: "I had an electrical emergency, and he provided urgent help."
    },
    {
      name: "Divyaksh",
      rating: 5,
      review: "I had an plumbing emergency, and he provided urgent help"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main>
        <HeroSection />
        <ServicesSection services={services} />
        <PopularServicesSection popularServices={popularServices} />

        <TestimonialsSection testimonials={testimonials} />

        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
