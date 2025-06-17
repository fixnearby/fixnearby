// frontend/src/components/RepairerDashboard/OnlineDashboardContent.jsx
import React from 'react';
import {Navigation, AlertCircle, MoreVertical, MapPin, Calendar, Clock, DollarSign, Tag } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner.jsx'; // Assuming this is in src/components/
import ErrorMessage from '../ErrorMessage.jsx'; // Assuming this is in src/components/

const OnlineDashboardContent = ({ 
  jobs, 
  loadingJobs, 
  errorJobs, 
  searchQuery, 

  selectedFilter, 

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
          {filteredJobs.map((job) => {
            const date = new Date(job.date);

            // Format the date
            const formattedDate = date.toLocaleDateString(); // Default format based on browser locale

            return(
               <div key={job.id} className="max-w-xl mx-auto p-4 bg-gray-50">
      <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`bg-gradient-to-r ${job.color} text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg`}>
                {job.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-gray-600 font-medium">{job.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getUrgencyColor(job.urgency)} backdrop-blur-sm`}>
                {job.urgency} Priority
              </span>
              <button className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Issue & Description */}
          <div className="mb-6">
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-4">
              <h4 className="font-semibold text-amber-800 mb-2">Issue:</h4>
              <p className="text-amber-700">{job.issue}</p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Description:</h4>
              <p className="text-blue-700">{job.description}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-700 mb-6 bg-gray-50 p-3 rounded-xl">
            <MapPin className="w-5 h-5 mr-3 text-red-500" />
            <span className="font-medium">{job.location}</span>
          </div>

          {/* Job Details Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center text-green-700">
                <DollarSign className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-600">Quotation</p>
                  <p className="text-xl font-bold text-green-800">₹{job.quotation}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center text-purple-700">
                <Calendar className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-600">Preferred Date</p>
                  <p className="text-sm font-semibold text-purple-800">{formattedDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <div className="flex items-center text-indigo-700">
                <Clock className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-indigo-600">Preferred Time</p>
                  <p className="text-sm font-semibold text-indigo-800">{job.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Tag className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.tags && job.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-medium border border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="font-medium">Posted:</span> {job.postedTime}
            </div>
            <div className="flex space-x-3">
              <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium">
                View Details
              </button>
              <button
                onClick={() => handleAcceptJob(job.id)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 font-semibold cursor-pointer"
              >
                Accept Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default OnlineDashboardContent;