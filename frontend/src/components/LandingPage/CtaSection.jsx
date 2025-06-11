// frontend/src/components/LandingPage/CtaSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Fix Your Home?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of satisfied customers who trust fixNearby for their home repairs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/user/getotp"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Today
          </Link>
          <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
            Call Now: 1-800-FIX-HOME
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;