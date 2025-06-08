import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Shield,
  Wind,
  Tv,
  Car,
  LogOut,
  Clock,
  CheckCircle,
  User,
  Bell,
  Settings
} from 'lucide-react';
import { useAuthStore } from "../../../store/authStore";

const UserMaindashboard = () => {
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);
  // Get the user object directly from the store
  const authenticatedUser = useAuthStore((state) => state.user);

  // Initialize the local 'user' state with data from the authenticatedUser
  // It's good practice to provide a fallback empty object if authenticatedUser is null/undefined initially
  const [user] = useState(authenticatedUser || { fullname: '', email: '' });

  const services = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Electrician",
      description: "Electrical repairs, wiring, and installations",
      color: "from-yellow-400 to-orange-500",
      category: "electrician"
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Plumber",
      description: "Plumbing repairs, pipe fixing, and water solutions",
      color: "from-blue-400 to-cyan-500",
      category: "plumber"
    },
    {
      icon: <Wind className="w-8 h-8" />,
      title: "AC Repair",
      description: "Air conditioning repair and maintenance",
      color: "from-green-400 to-emerald-500",
      category: "ac-repair"
    },
    {
      icon: <Hammer className="w-8 h-8" />,
      title: "Carpenter",
      description: "Wood work, furniture repair, and custom carpentry",
      color: "from-amber-400 to-yellow-600",
      category: "carpenter"
    },
    {
      icon: <Paintbrush className="w-8 h-8" />,
      title: "Painter",
      description: "Interior and exterior painting services",
      color: "from-purple-400 to-pink-500",
      category: "painter"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Home Security",
      description: "Security system installation and maintenance",
      color: "from-red-400 to-rose-500",
      category: "security"
    },
    {
      icon: <Tv className="w-8 h-8" />,
      title: "Appliance Repair",
      description: "Home appliance repair and maintenance",
      color: "from-indigo-400 to-blue-500",
      category: "appliance"
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: "Vehicle Service",
      description: "Car and bike repair services",
      color: "from-slate-400 to-gray-500",
      category: "vehicle"
    }
  ];

  const handleServiceClick = (category) => {
    navigate(`/user/show-services?category=${category}`);
  };

  const handleLogout = async () => {
    try {
      // API call to logout
      const response = await fetch('/api/user/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        clearUser();
        navigate('/');
        
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                fixNearby
              </span>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">{user.fullname}</span>
              </div>

              <button
                onClick={() => navigate('/user/inprogress')}
                className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">In Progress</span>
              </button>

              <button
                onClick={() => navigate('/user/pending-service')}
                className="flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full hover:bg-yellow-200 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Pending</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.fullname.split(' ')[0]}</span>!
          </h1>
          <p className="text-xl text-gray-600">Choose a service to get started with your home repairs</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              onClick={() => handleServiceClick(service.category)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer"
            >
              <div className="p-6">
                <div className={`bg-gradient-to-r ${service.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{service.title}</h3>
                <p className="text-gray-600 text-sm text-center mb-4">{service.description}</p>
                <div className="text-center">
                  <button className="text-blue-600 font-semibold group-hover:text-purple-600 transition-colors text-sm">
                    Book Service →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Services</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">In Progress</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserMaindashboard;