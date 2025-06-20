// frontend/src/components/LandingPage/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import images from "../../assets/images.js";

const Header = ({ isMenuOpen, setIsMenuOpen }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white text-gray-800 shadow-md z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center flex-shrink-0 cursor-pointer">
          <Link to="/">
            <img
              src={images.logooo}
              alt="Fix Nearby Logo"
              className="h-20 w-auto object-contain"
              style={{ maxHeight: "48px" }}
            />
          </Link>
        </div>

        <div className="hidden md:flex space-x-8">
          <Link
            to="/"
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            Home
          </Link>
          <Link
            to="/services"
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            Services
          </Link>
          <Link
            to="/contact-us"
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            Contact
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <a
            href="/user/login"
            className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium"
          >
            Login
          </a>
          <a
            href="/user/getotp"
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 shadow-md font-medium"
          >
            Sign Up
          </a>
        </div>

        <button
          className="md:hidden text-gray-800 focus:outline-none p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <Link
              to="/"
              className="border-2 border-black text-center block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/services"
              className="border-2 border-black text-center block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/contact-us"
              className="border-2 border-black text-center block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
            <hr className="my-2 border-gray-200" />
            <a
              href="/user/login"
              className="border-2 border-black block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </a>
            <a
              href="/user/signup"
              className="border-2 border-black block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
