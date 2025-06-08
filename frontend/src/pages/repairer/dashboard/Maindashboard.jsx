import React, { useState } from 'react';
import { 
  Wrench, 
  Zap, 
  Droplets, 
  Hammer, 
  Paintbrush, 
  Shield, 
  Bell,
  User,
  Settings,
  LogOut,
  MapPin,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  Calendar,
  Phone,
  MessageCircle,
  Navigation,
  Filter,
  Search,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

const RepairerDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for nearby work opportunities
  const nearbyJobs = [
    {
      id: 1,
      title: "Kitchen Sink Leak Repair",
      category: "Plumbing",
      location: "Downtown, 2.3 km away",
      price: "$75-$120",
      urgency: "High",
      postedTime: "15 mins ago",
      description: "Kitchen sink has a persistent leak under the cabinet. Need immediate attention.",
      customerRating: 4.8,
      estimatedDuration: "1-2 hours",
      icon: <Droplets className="w-5 h-5" />,
      color: "from-blue-400 to-cyan-500",
      tags: ["Emergency", "Verified Customer"]
    },
    {
      id: 2,
      title: "Electrical Outlet Installation",
      category: "Electrical",
      location: "Suburbs, 1.8 km away",
      price: "$90-$150",
      urgency: "Medium",
      postedTime: "1 hour ago",
      description: "Need to install 3 new electrical outlets in the living room for home office setup.",
      customerRating: 4.5,
      estimatedDuration: "2-3 hours",
      icon: <Zap className="w-5 h-5" />,
      color: "from-yellow-400 to-orange-500",
      tags: ["Flexible Timing", "Materials Provided"]
    },
    {
      id: 3,
      title: "Bedroom Door Repair",
      category: "Carpentry",
      location: "City Center, 3.1 km away",
      price: "$60-$100",
      urgency: "Low",
      postedTime: "3 hours ago",
      description: "Bedroom door is not closing properly, needs adjustment and minor repair work.",
      customerRating: 4.9,
      estimatedDuration: "1 hour",
      icon: <Hammer className="w-5 h-5" />,
      color: "from-amber-400 to-yellow-600",
      tags: ["Weekend Available", "Quick Job"]
    },
    {
      id: 4,
      title: "Living Room Wall Painting",
      category: "Painting",
      location: "Residential Area, 2.7 km away",
      price: "$200-$350",
      urgency: "Medium",
      postedTime: "5 hours ago",
      description: "Need professional painting for living room walls. Premium paint will be provided.",
      customerRating: 4.6,
      estimatedDuration: "1 day",
      icon: <Paintbrush className="w-5 h-5" />,
      color: "from-purple-400 to-pink-500",
      tags: ["Large Project", "Premium Materials"]
    }
  ];

  // Mock data for dashboard stats
  const stats = [
    { title: "Jobs Completed", value: "127", change: "+12%", icon: <CheckCircle className="w-6 h-6" /> },
    { title: "Earnings This Month", value: "$2,450", change: "+8%", icon: <DollarSign className="w-6 h-6" /> },
    { title: "Average Rating", value: "4.9", change: "+0.1", icon: <Star className="w-6 h-6" /> },
    { title: "Active Jobs", value: "3", change: "+1", icon: <Target className="w-6 h-6" /> }
  ];

  const recentActivity = [
    { type: "completed", message: "Completed plumbing repair for Sarah J.", time: "2 hours ago", amount: "$85" },
    { type: "accepted", message: "Accepted electrical work in Downtown", time: "5 hours ago", amount: "$120" },
    { type: "rating", message: "Received 5-star rating from Mike C.", time: "1 day ago", amount: null },
    { type: "completed", message: "Finished carpentry work for Emma D.", time: "2 days ago", amount: "$95" }
  ];

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs = nearbyJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || job.category.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Online Status */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  fixNearby
                </span>
              </div>
              
              {/* Online/Offline Switch */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isOnline ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
            </div>

            {/* Navigation & Profile */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">John Smith</div>
                  <div className="text-xs text-gray-500">Professional Repairer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isOnline ? (
          // Online View - Show Nearby Jobs
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">You're Online & Ready!</h1>
                  <p className="text-blue-100 text-lg">
                    {filteredJobs.length} nearby jobs available in your area
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6">
                    <Navigation className="w-12 h-12 text-white mb-2" />
                    <div className="text-sm">Actively Searching</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                  </select>
                  <button className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    <Filter className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`bg-gradient-to-r ${job.color} text-white w-12 h-12 rounded-xl flex items-center justify-center`}>
                          {job.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(job.urgency)}`}>
                          {job.urgency} Priority
                        </span>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{job.description}</p>

                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{job.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="text-sm font-semibold text-green-600">{job.price}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{job.estimatedDuration}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Star className="w-4 h-4 mr-2 fill-current text-yellow-400" />
                        <span className="text-sm">{job.customerRating} rating</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Posted {job.postedTime}
                      </div>
                      <div className="flex space-x-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                          Accept Job
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            )}
          </div>
        ) : (
          // Offline View - Dashboard Overview
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h1>
                  <p className="text-gray-600 text-lg">
                    You're currently offline. Switch online to see available jobs in your area.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6">
                    <User className="w-12 h-12 text-gray-600 mb-2" />
                    <div className="text-sm text-gray-600">Offline Mode</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.title}</div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'completed' ? 'bg-green-400' : 
                        activity.type === 'accepted' ? 'bg-blue-400' : 
                        'bg-yellow-400'
                      }`} />
                      <div>
                        <p className="text-gray-900 font-medium">{activity.message}</p>
                        <p className="text-gray-500 text-sm">{activity.time}</p>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-green-600 font-semibold">{activity.amount}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                  <TrendingUp className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">View Analytics</div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                  <Award className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Manage Profile</div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
                  <MessageCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-900">Messages</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairerDashboard;