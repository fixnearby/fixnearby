import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Wrench, Zap, Shield, Star } from 'lucide-react';
import { useNavigate , Link} from 'react-router-dom';


const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cursorTrail, setCursorTrail] = useState([]);
  const trailRef = useRef([]);
  const navigate = useNavigate();
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let animationFrameId;
    
    const handleMouseMove = (e) => {
      const newPoint = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now() + Math.random(),
        opacity: 1,
        scale: 1,
        waveOffset: 0,
      };
      
      trailRef.current = [newPoint, ...trailRef.current.slice(0, 15)];
      
      // Update trail positions with wave effect
      trailRef.current = trailRef.current.map((point, index) => ({
        ...point,
        opacity: Math.max(0, 1 - (index * 0.08)),
        scale: Math.max(0.1, 1 - (index * 0.06)),
        waveOffset: Math.sin((Date.now() * 0.01) + (index * 0.5)) * (10 + index * 2)
      }));
      
      setCursorTrail([...trailRef.current]);
    };

    const animateTrail = () => {
      if (trailRef.current.length > 0) {
        trailRef.current = trailRef.current.map((point, index) => ({
          ...point,
          opacity: Math.max(0, point.opacity - 0.02),
          waveOffset: Math.sin((Date.now() * 0.01) + (index * 0.5)) * (10 + index * 2)
        })).filter(point => point.opacity > 0);
        
        setCursorTrail([...trailRef.current]);
      }
      animationFrameId = requestAnimationFrame(animateTrail);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(animateTrail);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Custom Cursor Trail */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {cursorTrail.map((point, index) => (
          <div
            key={point.id}
            className="absolute"
            style={{
              left: point.x + point.waveOffset,
              top: point.y,
              transform: `translate(-50%, -50%) scale(${point.scale})`,
              opacity: point.opacity * 0.6,
              pointerEvents: 'none',
            }}
          >
            {/* Wavy blur effect using multiple overlapping elements */}
            <div className="relative">
              <div 
                className="absolute w-20 h-6 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: `rotate(${Math.sin(Date.now() * 0.005 + index) * 15}deg)`,
                  filter: `blur(${8 + index * 2}px)`,
                }}
              />
              <div 
                className="absolute w-16 h-4 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: `rotate(${Math.sin(Date.now() * 0.008 + index + 1) * -20}deg) translateX(${Math.sin(Date.now() * 0.01 + index) * 8}px)`,
                  filter: `blur(${6 + index * 1.5}px)`,
                }}
              />
              <div 
                className="absolute w-12 h-3 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: `rotate(${Math.sin(Date.now() * 0.012 + index + 2) * 25}deg) translateX(${Math.sin(Date.now() * 0.015 + index) * -6}px)`,
                  filter: `blur(${4 + index}px)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <section className="relative h-[700px] md:h-[800px] flex items-center justify-center text-center text-white overflow-hidden cursor-none">
        {/* Background Image with Parallax Effect */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ${
            isLoaded ? 'scale-100' : 'scale-110'
          }`}
          style={{ backgroundImage: "url('/images/hero.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/30"></div>
        </div>

        {/* Floating Service Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute top-20 left-10 w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-1000 delay-500 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
          >
            <Wrench className="w-8 h-8 text-emerald-400" />
          </div>
          <div
            className={`absolute top-32 right-16 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-1000 delay-700 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
          >
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div
            className={`absolute bottom-32 left-20 w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-1000 delay-900 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
          >
            <Shield className="w-7 h-7 text-purple-400" />
          </div>
          <div
            className={`absolute bottom-20 right-12 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-1000 delay-1100 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
          >
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white rounded-full opacity-60 animate-float-${i + 1}`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 p-4 max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="mb-8">
            <h1
              className={`text-5xl md:text-7xl lg:text-8xl font-bold leading-tight transition-all duration-1000 ${
                isLoaded
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-12 opacity-0'
              }`}
            >
              <span className="inline-block animate-text-shimmer bg-gradient-to-r from-white via-emerald-200 to-white bg-[length:200%_100%] bg-clip-text text-transparent">
                Your Home,
              </span>
              <br />
              <span
                className={`inline-block transition-all duration-1000 delay-300 ${
                  isLoaded
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-8 opacity-0'
                }`}
              >
                Our{' '}
                <span className="text-emerald-400 animate-pulse">Expertise</span>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className={`text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            Professional home services at your fingertips. Quality repairs,
            trusted experts, guaranteed satisfaction.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <button className="group bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2 animate-bounce-subtle pointer-events-auto cursor-pointer" onClick={() => navigate("/user/login")}> Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
    
            </button>
            
            <button className="group border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transform hover:-translate-y-1 transition-all duration-300 pointer-events-auto cursor-pointer" onClick={() => navigate("/contact-us")}>
              Contact Us
            </button>
          </div>

          {/* Stats Section */}
          <div
            className={`mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 transition-all duration-1000 delay-1000 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            {[
              { number: '10K+', label: 'Happy Customers', delay: 'delay-1000' },
              { number: '500+', label: 'Expert Technicians', delay: 'delay-1200' },
              { number: '24/7', label: 'Support Available', delay: 'delay-1400' },
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-center backdrop-blur-sm bg-white/10 rounded-2xl py-6 px-4 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg ${stat.delay} pointer-events-auto`}
              >
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2 animate-counter">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes text-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          
          @keyframes wave {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          
          @keyframes float-1 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes float-2 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(180deg); }
          }
          
          @keyframes float-3 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-25px) rotate(180deg); }
          }
          
          @keyframes float-4 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-35px) rotate(180deg); }
          }
          
          @keyframes float-5 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(180deg); }
          }
          
          @keyframes float-6 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-40px) rotate(180deg); }
          }
          
          @keyframes counter {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-text-shimmer {
            animation: text-shimmer 3s ease-in-out infinite;
          }
          
          .animate-bounce-subtle {
            animation: bounce-subtle 2s ease-in-out infinite;
          }
          
          .animate-wave {
            animation: wave 20s ease-in-out infinite;
          }
          
          .animate-float-1 {
            animation: float-1 6s ease-in-out infinite;
          }
          
          .animate-float-2 {
            animation: float-2 8s ease-in-out infinite;
          }
          
          .animate-float-3 {
            animation: float-3 10s ease-in-out infinite;
          }
          
          .animate-float-4 {
            animation: float-4 7s ease-in-out infinite;
          }
          
          .animate-float-5 {
            animation: float-5 9s ease-in-out infinite;
          }
          
          .animate-float-6 {
            animation: float-6 11s ease-in-out infinite;
          }
          
          .animate-counter {
            animation: counter 1s ease-out forwards;
          }
        `}</style>
      </section>
    </>
  );
};

export default HeroSection;

