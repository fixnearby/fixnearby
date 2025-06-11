// frontend/src/components/RepairerDashboard/OnlineDashboardContent.jsx
import React from 'react';
import { Navigation, Search, Filter, AlertCircle, Wrench, MapPin, DollarSign, Clock, Star, MoreVertical } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner.jsx'; // Assuming this is in src/components/
import ErrorMessage from '../ErrorMessage.jsx'; // Assuming this is in src/components/

const OnlineDashboardContent = ({ 
  jobs, 
  loadingJobs, 
  errorJobs, 
  searchQuery, 
  setSearchQuery, 
  selectedFilter, 
  setSelectedFilter, 
  handleAcceptJob, 
  getUrgencyColor 
}) => {
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (job.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || (job.category?.toLowerCase() || '') === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">You're Online & Ready!</h1>
            <p className="text-blue-100 text-lg">
              {loadingJobs ? 'Loading jobs...' : `${filteredJobs.length} nearby jobs available in your area`}
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
              <option value="electronics">Electronics</option>
              <option value="appliances">Appliance</option>
              <option value="automotive">Automotive</option>
              <option value="hvac">HVAC</option>
              <option value="other">Other</option>
            </select>
            <button className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      {loadingJobs ? (
        <LoadingSpinner message="Loading nearby jobs..." subMessage="Please wait a moment." />
      ) : errorJobs ? (
        <ErrorMessage message={`Error: ${errorJobs}. Please try again later.`} />
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`bg-gradient-to-r ${job.color || 'from-gray-400 to-gray-500'} text-white w-12 h-12 rounded-xl flex items-center justify-center`}>
                      {job.icon || <Wrench className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{job.title || 'Job Title Not Available'}</h3>
                      <p className="text-gray-600">{job.category || 'Category Not Available'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(job.urgency)}`}>
                      {job.urgency || 'Unknown'} Priority
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{job.description || 'No description provided.'}</p>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{job.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm font-semibold text-green-600">{job.price || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{job.estimatedDuration || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-2 fill-current text-yellow-400" />
                    <span className="text-sm">{job.customerRating || 'No'} rating</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags && job.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Posted {job.postedTime || 'N/A'}
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Accept Job
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnlineDashboardContent;