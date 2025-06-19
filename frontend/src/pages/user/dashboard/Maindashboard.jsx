// frontend/src/pages/user/dashboard/Maindashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore.js';
import { getUserDashboardStats, getUserRecentActivity } from '../../../services/apiService.js';
import toast from 'react-hot-toast';
import AnimatedNumber from '../../../components/common/AnimatedNumber.jsx';
import ServiceRequestFormModal from '../../../components/user/ServiceRequestFormModal.jsx';
import DashboardHeader from '../../../components/user/DashboardHeader.jsx';

import {
  AirVent,
  User,
  Clock,
  X,
  Info,
  Sparkles,
  Droplets,
  Hammer,
  Paintbrush,
  PaintRoller,
  Bug,
  Shield,
  Truck,
  Flower,
  Ruler,
  Wrench,
  MessageCircle,
  Bell,
  Home,
  ClipboardList,
  Edit,
  Users,
  ThumbsUp,
  ClipboardCheck,
  FileText,
  Briefcase,
  Rocket,
  LayoutDashboard,
  Zap,
  ArrowRight,
  CheckCircle
} from "lucide-react";


const UserMainDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isAuthenticated = !!user;

  const [showServiceFormModal, setShowServiceFormModal] = useState(false);
  const [selectedServiceData, setSelectedServiceData] = useState(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalServices: 0,
    completedServices: 0,
    inProgressServices: 0,
  });
  const [recentUserActivity, setRecentUserActivity] = useState([]);
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [errorDashboardData, setErrorDashboardData] = useState(null);

  const serviceIcons = {
    "Appliances": AirVent,
    "Electrical": Zap,
    "Plumbing": Droplets,
    "Carpentry": Hammer,
    "Cleaning": Paintbrush,
    "Painting & Renovation": PaintRoller,
    "Pest Control": Bug,
    "Security & Automation": Shield,
    "Moving & Storage": Truck,
    "Gardening & Landscaping": Flower,
    "Interior Design": Ruler,
    "General Repairs": Wrench,
    "Specialized Services": Sparkles,
    "Service Requested": FileText,
    "Service In Progress": Briefcase,
    "Service Completed": ClipboardCheck,
    "Service Cancelled": X,
    "Account Update": User,
    "Notification": Bell,
    "Message": MessageCircle,
  };

  const getIconForType = (type) => {
    if (serviceIcons[type]) return serviceIcons[type];
    if (type.toLowerCase().includes("requested")) return serviceIcons["Service Requested"];
    if (type.toLowerCase().includes("in progress")) return serviceIcons["Service In Progress"];
    if (type.toLowerCase().includes("completed")) return serviceIcons["Service Completed"];
    if (type.toLowerCase().includes("cancelled")) return serviceIcons["Service Cancelled"];
    if (type.toLowerCase().includes("message")) return serviceIcons["Message"];
    if (type.toLowerCase().includes("account")) return serviceIcons["Account Update"];
    return Home;
  };


  const services = [
    {
      icon: AirVent,
      title: "Appliances",
      description: "Repair & maintenance for AC, fridge, washing machine & more.",
      category: "Appliances"
    },
    {
      icon: Zap,
      title: "Electrical",
      description: "Wiring, fixtures, short circuits, and new installations.",
      category: "Electrical"
    },
    {
      icon: Droplets,
      title: "Plumbing",
      description: "Leak repair, pipe fitting, drainage issues & bathroom fixes.",
      category: "Plumbing"
    },
    {
      icon: Hammer,
      title: "Carpentry",
      description: "Furniture repair, custom woodwork, doors, and window fixes.",
      category: "Carpentry"
    },
    {
      icon: Paintbrush,
      title: "Cleaning",
      description: "Deep home cleaning, bathroom, kitchen, & office cleaning.",
      category: "Cleaning"
    },
    {
      icon: PaintRoller,
      title: "Painting & Renovation",
      description: "Interior/exterior painting, minor wall repairs & upgrades.",
      category: "Painting & Renovation"
    },
    {
      icon: Bug,
      title: "Pest Control",
      description: "Effective solutions for termites, rodents, cockroaches & more.",
      category: "Pest Control"
    },
    {
      icon: Shield,
      title: "Security & Automation",
      description: "Smart locks, CCTV installation, alarm systems & automation.",
      category: "Security & Automation"
    },
    {
      icon: Truck,
      title: "Moving & Leasing",
      description: "Reliable packing, shifting, and secure short-term storage.",
      category: "Moving & Leasing"
    },
    {
      icon: Flower,
      title: "Gardening & Landscaping",
      description: "Garden design, plant care, lawn maintenance & landscape work.",
      category: "Gardening & Landscaping"
    },
    {
      icon: Ruler,
      title: "Interior Design",
      description: "Personalized home styling, space planning & decor solutions.",
      category: "Interior Design"
    },
    {
      icon: Wrench,
      title: "General Repairs",
      description: "Odd jobs, general household fixes, and small installations.",
      category: "Repairs and Installation"
    },
    {
      icon: Sparkles,
      title: "Specialized Services",
      description: "Accessibility mods, gutter cleaning, septic tank maintenance.",
      category: "Specialized Services"
    }
  ];
  const refreshDashboardStats = useCallback(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) {
        setLoadingDashboardData(false);
        return;
      }
      setLoadingDashboardData(true);
      setErrorDashboardData(null);
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          getUserDashboardStats(),
          getUserRecentActivity()
        ]);
        setDashboardStats({
          totalServices: statsResponse.totalServices,
          completedServices: statsResponse.completedServices,
          inProgressServices: statsResponse.inProgressServices,
        });
        setRecentUserActivity(activityResponse);
      } catch (err) {
        console.error("Error fetching user dashboard data:", err);
        setErrorDashboardData("Failed to load dashboard data. Please refresh.");
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoadingDashboardData(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    refreshDashboardStats();
  }, [user, refreshDashboardStats]);


  const handleServiceClick = (service) => {
    if (!isAuthenticated) {
      toast.error("Please login to request a service.");
      navigate('/user/login');
      return;
    }
    setSelectedServiceData(service);
    setShowServiceFormModal(true);
  };

  const handleQuickActionNewService = () => {
    if (!isAuthenticated) {
      toast.error("Please login to request a service.");
      navigate('/user/login');
      return;
    }
    setSelectedServiceData(null);
    setShowServiceFormModal(true);
  };


  const handleModalClose = () => {
    setShowServiceFormModal(false);
    setSelectedServiceData(null);
  };
  const handleMessagesClick = () => {
    console.log("User Messages button clicked. Navigating to /user/messages");
    navigate('/user/messages');
  };

  const handleNotificationsClick = () => {
    console.log("User Notifications button clicked. Navigating to /user/notifications");
    navigate('/user/notifications');
  };

  if (!user && !loadingDashboardData) {
    return (
      <div className="min-h-screen bg-[#F9F6F1] py-8 px-4 sm:py-12 sm:px-6 lg:px-8 flex items-center justify-center font-lexend text-[#2C2C2C]">
        <div className="text-center p-6 sm:p-10 bg-white rounded-xl shadow-lg border border-gray-200 animate-fadeInUp">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2C2C2C] mb-3 sm:mb-4">Access Denied</h2>
          <p className="text-[#2C2C2C] mb-6 sm:mb-8 text-base sm:text-xl leading-relaxed">Please log in as a user to unlock your personalized dashboard and services.</p>
          <Link to="/user/login" className="px-6 py-3 sm:px-10 sm:py-4 bg-[#8CC76E] text-white font-bold rounded-xl hover:bg-[#72A658] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 text-base sm:text-lg">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] font-lexend antialiased overflow-hidden text-[#2C2C2C]">

      <DashboardHeader
        user={user}
        handleMessagesClick={handleMessagesClick}
        handleNotificationsClick={handleNotificationsClick}
      />

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-16">

        <div className="mb-12 sm:mb-20 text-center animate-fadeInUp">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2C2C2C] mb-3 sm:mb-4 leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8CC76E] to-[#72A658]">{user?.fullname?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-[#2C2C2C] max-w-xl sm:max-w-3xl mx-auto font-light text-base sm:text-lg">
            Your one-stop solution for all home services. Let's make your life easier.
          </p>
        </div>

        <section className="mb-12 sm:mb-20 animate-fadeInUp delay-100">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-8 sm:mb-10 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-2xl sm:max-w-4xl mx-auto">
            <Link
              to="#"
              onClick={handleQuickActionNewService}
              className="group bg-gradient-to-br from-[#8CC76E] to-[#72A658] text-white rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-[#8CC76E] focus:ring-offset-2"
            >
              <Rocket className="w-12 h-12 mb-3 sm:w-16 sm:h-16 sm:mb-4 text-white transition-transform group-hover:rotate-6 group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Request New Service</h3>
              <p className="text-white text-sm sm:text-base leading-relaxed opacity-90">Quickly book any home repair or maintenance.</p>
            </Link>
            <Link
              to="/user/inprogress"
              className="group bg-white rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-offset-2"
            >
              <LayoutDashboard className="w-12 h-12 mb-3 sm:w-16 sm:h-16 sm:mb-4 text-[#2C2C2C] transition-transform group-hover:-rotate-6 group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-1 sm:mb-2">View Active Requests</h3>
              <p className="text-[#2C2C2C] text-sm sm:text-base leading-relaxed">Track the status of your ongoing and pending services.</p>
            </Link>
          </div>
        </section>


        <section className="mb-12 sm:mb-20 animate-fadeInUp delay-200">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-8 sm:mb-10 text-center">Explore Our Home Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch">
            {services.map((service, index) => (
              <div
                key={index}
                className="service-card bg-white rounded-xl border border-gray-100 cursor-pointer overflow-hidden group relative p-6 sm:p-8 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#F9F6F1] to-white rounded-t-xl -z-10 opacity-70"></div>
                <div className={`bg-gradient-to-br from-[#8CC76E] to-[#72A658] text-white w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md group-hover:shadow-lg`}>
                  {React.createElement(service.icon, { className: "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" })}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-2 sm:mb-3">{service.title}</h3>
                <p className="text-[#2C2C2C] text-sm mb-4 sm:mb-6 line-clamp-3 leading-relaxed">{service.description}</p>

                <div className="mt-auto w-full">
                  <button
                    onClick={() => handleServiceClick(service)}
                    className="w-full bg-[#8CC76E] text-white py-2.5 sm:py-3 rounded-xl font-bold text-base sm:text-lg hover:bg-[#72A658] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#8CC76E] focus:ring-offset-2"
                  >
                    Book Visit <span className="ml-2 px-1.5 py-0.5 bg-white text-[#8CC76E] rounded-full text-xs font-bold">FREE</span>
                    <ArrowRight className="ml-1.5 w-4 h-4 sm:ml-2 sm:w-5 sm:h-5 text-white transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                  </button>
                  <div className="text-xs text-[#2C2C2C] leading-snug mt-2 sm:mt-3 px-1.5 py-0.5 bg-green-50 border border-[#8CC76E] rounded-lg">
                    <strong className="text-red-600">Note:</strong> ₹150 cancellation fee applies after technician visit.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 sm:mb-20 bg-white rounded-xl shadow-md p-6 sm:p-10 lg:p-14 border border-gray-100 animate-fadeInUp delay-300">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-8 sm:mb-12 text-center">Our Simple Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 sm:gap-y-10 lg:gap-x-8 relative">

            <div className="absolute hidden lg:block inset-x-0 top-[25%] transform -translate-y-1/2 z-0">
              <div className="flex justify-between items-center px-16">
                <div className="w-full border-t-2 border-dashed border-[#8CC76E]"></div>
                <div className="w-full border-t-2 border-dashed border-[#8CC76E]"></div>
                <div className="w-full border-t-2 border-dashed border-[#8CC76E]"></div>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-3 sm:p-4 relative z-10 animate-fadeInUp delay-400">
              <div className="bg-gradient-to-br from-[#8CC76E] to-[#72A658] text-white p-4 sm:p-6 rounded-xl mb-4 sm:mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C] mb-1.5 sm:mb-2">1. Choose Service</h3>
              <p className="text-[#2C2C2C] text-sm leading-relaxed">Browse our categories and select the perfect service for your needs.</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 relative z-10 animate-fadeInUp delay-500">
              <div className="bg-gradient-to-br from-[#8CC76E] to-[#72A658] text-white p-4 sm:p-6 rounded-xl mb-4 sm:mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Edit className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C] mb-1.5 sm:mb-2">2. Describe Job</h3>
              <p className="text-[#2C2C2C] text-sm leading-relaxed">Tell us what you need done, when, and where. It's quick & easy.</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 relative z-10 animate-fadeInUp delay-600">
              <div className="bg-gradient-to-br from-[#8CC76E] to-[#72A658] text-white p-4 sm:p-6 rounded-xl mb-4 sm:mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C] mb-1.5 sm:mb-2">3. Get Matched</h3>
              <p className="text-[#2C2C2C] text-sm leading-relaxed">We connect you with highly-rated, local service professionals.</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 relative z-10 animate-fadeInUp delay-700">
              <div className="bg-gradient-to-br from-[#8CC76E] to-[#72A658] text-white p-4 sm:p-6 rounded-xl mb-4 sm:mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <ThumbsUp className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2C2C2C] mb-1.5 sm:mb-2">4. Service Done!</h3>
              <p className="text-[#2C2C2C] text-sm leading-relaxed">Enjoy your restored home. Pay securely after the job is complete.</p>
            </div>
          </div>
        </section>

        <section className="mb-12 sm:mb-20 animate-fadeInUp delay-400">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-8 sm:mb-10 text-center">Your Dashboard At a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {loadingDashboardData ? (
              <>
                <div className="bg-gray-200 rounded-xl p-8 sm:p-10 animate-pulse h-40 sm:h-48 shadow-md"></div>
                <div className="bg-gray-200 rounded-xl p-8 sm:p-10 animate-pulse h-40 sm:h-48 shadow-md"></div>
                <div className="bg-gray-200 rounded-xl p-8 sm:p-10 animate-pulse h-40 sm:h-48 shadow-md"></div>
              </>
            ) : errorDashboardData ? (
              <div className="md:col-span-3 bg-red-100 text-red-700 p-4 sm:p-6 rounded-xl border border-red-200 text-center font-medium shadow-md text-sm sm:text-base">
                <Info className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Error: {errorDashboardData}
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl p-6 sm:p-8 text-[#2C2C2C] flex flex-col items-center justify-center border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <Home className="w-12 h-12 sm:w-14 sm:h-14 text-[#2C2C2C] mb-3 sm:mb-4" strokeWidth={1.5} />
                  <p className="text-[#2C2C2C] text-base sm:text-lg font-medium">Total Services</p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-[#2C2C2C] mt-1.5 sm:mt-2">
                    <AnimatedNumber value={dashboardStats.totalServices} />
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#8CC76E] to-[#72A658] rounded-xl p-6 sm:p-8 text-white flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white mb-3 sm:mb-4" strokeWidth={1.5} />
                  <p className="text-white text-base sm:text-lg font-medium">Completed Services</p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-white mt-1.5 sm:mt-2">
                    <AnimatedNumber value={dashboardStats.completedServices} />
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 sm:p-8 text-white flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <Clock className="w-12 h-12 sm:w-14 sm:h-14 text-orange-200 mb-3 sm:mb-4" strokeWidth={1.5} />
                  <p className="text-orange-100 text-base sm:text-lg font-medium">In Progress</p>
                  <p className="text-4xl sm:text-5xl font-extrabold text-white mt-1.5 sm:mt-2">
                    <AnimatedNumber value={dashboardStats.inProgressServices} />
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mb-8 sm:mb-16 animate-fadeInUp delay-500">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-8 sm:mb-10 text-center">Your Recent Activity</h2>
          {loadingDashboardData ? (
            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-md animate-pulse border border-gray-100">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 sm:h-14 bg-gray-200 rounded-lg mb-3 sm:mb-4 last:mb-0"></div>
              ))}
            </div>
          ) : errorDashboardData ? (
            <div className="bg-red-100 text-red-700 p-4 sm:p-6 rounded-xl border border-red-200 text-center font-medium shadow-md text-sm sm:text-base">
              <Info className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Error: {errorDashboardData}
            </div>
          ) : recentUserActivity.length === 0 ? (
            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-md text-center text-[#2C2C2C] text-base sm:text-xl border border-gray-100">
              <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[#2C2C2C]" />
              <p>No recent activity to display yet. Let's get some services booked!</p>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-100">
              <ul className="divide-y divide-gray-200">
                {recentUserActivity.map((activity, index) => {
                  const ActivityIcon = getIconForType(activity.message);
                  return (
                    <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center py-3 sm:py-4 first:pt-0 last:pb-0 group hover:bg-gray-50 transition-colors duration-200 rounded-lg px-2 sm:px-3 -mx-2 sm:-mx-3">
                      <div className="flex items-center mb-1.5 sm:mb-0 sm:mr-6 w-full sm:w-auto">
                        <div className="p-1.5 sm:p-2 bg-[#F9F6F1] rounded-full mr-3 sm:mr-4 shadow-sm group-hover:bg-gray-200 transition-colors">
                          <ActivityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#8CC76E]" strokeWidth={2} />
                        </div>
                        <span className="text-[#2C2C2C] font-medium text-base sm:text-lg leading-snug">{activity.message}</span>
                      </div>
                      <span className="ml-auto text-xs sm:text-sm text-[#2C2C2C] mt-0.5 sm:mt-0 whitespace-nowrap">{activity.time}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

      </main>

      <ServiceRequestFormModal
        isOpen={showServiceFormModal}
        onClose={handleModalClose}
        initialServiceType={selectedServiceData?.category || null}
        initialDefaultTitle={selectedServiceData?.title || null}
        onServiceCreated={refreshDashboardStats}
      />

      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInDown { animation: slideInDown 0.5s ease-out forwards; }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }

        input:focus, textarea:focus, select:focus, button:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(140, 199, 110, 0.5), 0 0 0 2px white;
          border-color: #8CC76E;
        }

        select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: none;
        }
        .font-lexend {
            font-family: 'Lexend', sans-serif;
        }
        `}
      </style>
    </div>
  );
};

export default UserMainDashboard;