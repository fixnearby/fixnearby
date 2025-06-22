import React from "react";
import { Link } from "react-router-dom";

const ServicesSection = ({ services }) => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-12 animate-fade-in-up">
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              to="/user/login"
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-in-out border border-gray-200"
            >
              <div className="h-36 overflow-hidden rounded-t-2xl">
                <img
                  loading='lazy'
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  width="300"
                  height="144"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold text-green-700">
                  {service.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
        <section className="pt-16 text-center">
          <div className="container mx-auto px-4">
            <a
              href="/services"
              className="inline-flex items-center justify-center px-10 py-4
                         bg-green-500 text-white text-xl font-semibold rounded-full
                         shadow-lg hover:bg-green-600 transform hover:scale-105
                         transition-all duration-300 ease-in-out"
            >
              View All Services
            </a>
          </div>
        </section>
      </div>
    </section>
  );
};

export default ServicesSection;