// frontend/src/components/LandingPage/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, Zap, Droplets, Hammer, Paintbrush, Shield
} from 'lucide-react';

const serviceIcons = {
  electrical: <Zap className="w-8 h-8" />,
  plumbing: <Droplets className="w-8 h-8" />,
  carpentry: <Hammer className="w-8 h-8" />,
  painting: <Paintbrush className="w-8 h-8" />,
  hvac: <Wrench className="w-8 h-8" />,
  security: <Shield className="w-8 h-8" />
};

const HeroSection = ({ services, stats }) => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Home Repairs
                </span>
                <br />
                Made Simple
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Connect with trusted local professionals for all your home repair needs.
                Fast, reliable, and affordable services at your fingertips.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/user/getotp"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                Get Started Now
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              {stats.slice(0, 2).map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-1">
              <div className="bg-white rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {services.slice(0, 4).map((service, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                      <div className={`bg-gradient-to-r ${service.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                        {serviceIcons[service.title.split(' ')[0].toLowerCase()] || <Wrench className="w-8 h-8" />}
                      </div>
                      <h3 className="font-semibold text-sm">{service.title}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;