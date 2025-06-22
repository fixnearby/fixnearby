import React, { useState, useEffect } from 'react';
import { Navigation, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner.jsx';
import ErrorMessage from '../ErrorMessage.jsx';
import JobCard from './JobCard.jsx';

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

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!loadingJobs && !errorJobs) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [loadingJobs, errorJobs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {loadingJobs && <LoadingSpinner message="Loading jobs for you..." />}

      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">You're Online & Ready!</h1>
            <p className="text-green-100 text-base sm:text-lg">
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

      <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Available Jobs</h2>
        {errorJobs ? (
          <ErrorMessage message={`Error: ${errorJobs}. Please try again later.`} />
        ) : (
          <div className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-sm sm:text-base text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    handleAcceptJob={handleAcceptJob}
                    getUrgencyColor={getUrgencyColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default OnlineDashboardContent;