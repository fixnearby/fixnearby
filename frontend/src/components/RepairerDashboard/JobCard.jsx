import React, { useState } from 'react';
import { MoreVertical, MapPin, Calendar, Clock, IndianRupee, Tag, AlertTriangle, ClipboardList } from 'lucide-react';

const JobCard = ({ job, handleAcceptJob, getUrgencyColor }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const date = new Date(job.date);
  const formattedDate = date.toLocaleDateString();

  const onAcceptClick = async () => {
    setIsAccepting(true);
    setErrorMessage('');

    try {
      await handleAcceptJob(job.id);
    } catch (error) {
      console.error("Error accepting job in JobCard:", error);
      if (error.response && error.response.data && error.response.data.code === 'MAX_JOBS_REACHED') {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to accept job. An unexpected error occurred.');
      }
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="w-full px-2 sm:px-0">
      <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200">
        <div className="bg-green-50 p-3 sm:p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4">
            <div className="mb-2 sm:mb-0">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-0.5">{job.title}</h3>
              <p className="text-gray-600 font-medium text-xs sm:text-base">{job.category}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(job.urgency)} backdrop-blur-sm`}>
                {job.urgency} Priority
              </span>
              <button className="p-1 hover:bg-gray-100 hover:shadow-md rounded-xl transition-all duration-200">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
            <div className="bg-green-50 p-3 rounded-xl border border-green-200">
              <div className="flex items-center text-green-700">
                <IndianRupee className="w-4 h-4 mr-2" />
                <div>
                  <p className="text-xs font-medium text-green-600">Quotation</p>
                  <p className="text-base sm:text-xl font-bold text-green-800">₹{job.quotation}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <div className="flex items-center text-emerald-700">
                <Calendar className="w-4 h-4 mr-2" />
                <div>
                  <p className="text-xs font-medium text-emerald-600">Preferred Date</p>
                  <p className="text-sm font-semibold text-emerald-800">{formattedDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-lime-50 p-3 rounded-xl border border-lime-200">
              <div className="flex items-center text-lime-700">
                <Clock className="w-4 h-4 mr-2" />
                <div>
                  <p className="text-xs font-medium text-lime-600">Preferred Time</p>
                  <p className="text-sm font-semibold text-lime-800">{job.time}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <Tag className="w-3 h-3 mr-1.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.tags && job.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-xs font-medium border border-green-300 hover:shadow-md transition-all duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {showDetails && (
            <>
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="flex-grow bg-white border border-amber-200 py-2 px-3 rounded-lg shadow-sm flex items-start space-x-2 w-full sm:max-w-[calc(50%-0.5rem)] md:max-w-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-700 text-xs">Issue:</h4>
                    <p className="text-gray-800 text-xs leading-tight">{job.issue}</p>
                  </div>
                </div>
                <div className="flex-grow bg-white border border-green-200 py-2 px-3 rounded-lg shadow-sm flex items-start space-x-2 w-full sm:max-w-[calc(50%-0.5rem)] md:max-w-xs">
                  <ClipboardList className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-green-700 text-xs">Description:</h4>
                    <p className="text-gray-800 text-xs leading-tight">{job.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-700 mb-4 bg-gray-50 p-2.5 rounded-xl text-xs sm:text-sm">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                <span className="font-medium">{job.location}</span>
              </div>
            </>
          )}

          {errorMessage && (
            <div className="text-red-600 text-sm font-medium mt-3 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
              <span className="font-medium">Posted:</span> {job.postedTime}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full sm:w-auto px-3 py-1.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-center flex items-center justify-center text-xs sm:text-base"
              >
                {showDetails ? 'Show Less' : 'View Details'}
              </button>
              <button
                onClick={onAcceptClick}
                disabled={isAccepting}
                className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white rounded-xl hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300 font-semibold cursor-pointer flex items-center justify-center text-xs sm:text-base"
              >
                {isAccepting ? (
                  <div className="inline-block h-3 w-3 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                ) : (
                  'Accept Job'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;