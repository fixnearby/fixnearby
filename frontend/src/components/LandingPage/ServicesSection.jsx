// frontend/src/components/LandingPage/ServicesSection.jsx
import React from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import {
  Zap, Droplets, Hammer, Paintbrush, Shield
} from 'lucide-react';

const serviceIconsMapping = {
  electrical: <Zap className="w-8 h-8" />,
  plumbing: <Droplets className="w-8 h-8" />,
  carpentry: <Hammer className="w-8 h-8" />,
  painting: <Paintbrush className="w-8 h-8" />,
  hvac: <Wrench className="w-8 h-8" />,
  security: <Shield className="w-8 h-8" />
};

const ServicesSection = ({ services }) => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional home repair services delivered by certified experts in your neighborhood
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="p-8">
                <div className={`bg-gradient-to-r ${service.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {serviceIconsMapping[service.title.split(' ')[0].toLowerCase()] || <Wrench className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <button className="text-blue-600 font-semibold flex items-center group-hover:text-purple-600 transition-colors">
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;