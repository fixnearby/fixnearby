import React, { useState, useEffect } from 'react';
import images from '../assets/images';
import { Link, useNavigate } from "react-router-dom";
import Header from '../components/LandingPage/Header';



const ServiceCard = ({ service, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div 
      className={`group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="relative overflow-hidden h-48">
        <img
          loading='lazy'
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300 text-center">
          {service.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed text-center">
          {service.description}
        </p>
        <div className="flex justify-center">
          <a className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer" href="/user/dashboard" >
          <p className='text-center'>Book Now</p>
        </a>
        </div>
      </div>
    </div>
  );
};

const ServicesPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const services = [
    {
      image: images.appliances,
      title: "Appliances",
      description: "Repair & maintenance for AC, fridge, washing machine & more.",
    },
    {
      image: images.electrical,
      title: "Electrical",
      description: "Wiring, fixtures, short circuits, and new installations.",
    },
    {
      image: images.security,
      title: "Security",
      description: "Smart locks, CCTV installation, alarm systems & automation.",
    },
    {
      image: images.gardening,
      title: "Gardening",
      description: "Garden design, plant care, lawn maintenance & landscape work.",
    },
    {
      image: images.painting,
      title: "Painting",
      description: "Interior/exterior painting, minor wall repairs & upgrades.",
    },
    {
      image: images.pestcontrol,
      title: "Pest Control",
      description: "Effective solutions for termites, rodents, cockroaches & more.",
    },
    {
      image: images.plumber,
      title: "Plumbing",
      description: "Leak repair, pipe fitting, drainage issues & bathroom fixes.",
    },
    {
      image: images.cleaning,
      title: "Cleaning",
      description: "Deep home cleaning, bathroom, kitchen, & office cleaning.",
    },
    {
      image: images.septic,
      title: "Specialized Services",
      description: "Accessibility mods, gutter cleaning, septic tank maintenance.",
    },
    {
      image: images.carpentry,
      title: "Carpentry",
      description: "Furniture repair, custom woodwork, doors, and window fixes.",
    },
    {
      image: images.designing,
      title: "Interior Design",
      description: "Personalized home styling, space planning & decor solutions.",
    },
    {
      image: images.installation,
      title: "Installation",
      description: "Odd jobs, general household fixes, and small installations.",
    }
  ];

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-green-600 to-green-700 text-white py-16 mb-12">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                Our Services
              </h1>
              <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
                Professional home services at your fingertips. Quality work, trusted professionals, guaranteed satisfaction.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredServices.map((service, index) => (
              <ServiceCard 
                key={service.title}
                service={service}
                index={index}
              />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-1.009-5.927-2.616m10.854 2.323A7.954 7.954 0 0112 15" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No services found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Our customer service team is here to help you find the perfect service for your needs.
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer" onClick={()=>{
            navigate("/contact-us")
          }}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;