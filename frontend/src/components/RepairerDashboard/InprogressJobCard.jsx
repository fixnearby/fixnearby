import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  MapPin,
  User,
  Phone,
  CheckCircle,
  MessageCircle,
  DollarSign,
  IndianRupee,
  Calendar,
  ClipboardList,
  Edit,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const InprogressJobCard = ({
  job,
  quoteInputs,
  editingQuote,
  handleQuoteInputChange,
  handleQuoteSubmit,
  toggleEditQuote,
  handleConfirmCompleted,
  handleChat,
  handleCallCustomer,
  isSubmittingQuote,
  isSendingOtp,
}) => {
  
  const [showFullDetails, setShowFullDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col font-lexend">
      <div className="bg-green-50 p-4 -mx-6 -mt-6 mb-4 rounded-t-xl border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-1">
              {job.serviceType}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              {job.category}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              job.status === 'accepted'
                ? 'bg-green-100 text-green-800'
                : job.status === 'in_progress'
                ? 'bg-emerald-100 text-emerald-800'
                : job.status === 'quoted'
                ? 'bg-lime-100 text-lime-800'
                : job.status === 'pending_quote'
                ? 'bg-yellow-100 text-yellow-800'
                : job.status === 'pending_otp'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {job.status
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-[#2C2C2C] mb-4 text-sm sm:text-base">
        <div className="flex items-center">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 flex-shrink-0" />
          <span className="font-medium">Issue:</span>{' '}
          <span className="ml-1 truncate">{job.issue || 'N/A'}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 flex-shrink-0" />
          <span className="font-medium">Assigned:</span>{' '}
          <span className="ml-1">
            {job.assignedAt ? format(new Date(job.assignedAt), 'M/d/yyyy') : 'N/A'}
          </span>
        </div>
        <div className="flex items-start">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span className="font-medium">Location:</span>{' '}
          <span className={`ml-1 ${showFullDetails ? '' : 'truncate'}`}>
            {job.location?.address || 'N/A'}
          </span>
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 flex-shrink-0" />
          <span className="font-medium">Customer:</span>{' '}
          <span className={`ml-1 ${showFullDetails ? '' : 'truncate'}`}>
            {job.customer?.fullname || 'N/A'}
          </span>
        </div>
        <div className="flex items-center">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 flex-shrink-0" />
          <span className="font-medium">Phone:</span>{' '}
          <span className="ml-1">{job.contactInfo || 'N/A'}</span>
        </div>
      </div>

      {/* Get Full Details Button */}
      <div className="flex justify-center mt-4 mb-5">
        <button
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 transition-colors duration-200 font-medium cursor-pointer"
        >
          {showFullDetails ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Get Full Details
            </>
          )}
        </button>
      </div>

      {job.status !== 'completed' && job.status !== 'cancelled' && job.status !== 'rejected' && (job.customer || job.contactInfo) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={() => handleChat(job._id, job.conversationId)}
            className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-md border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4 mr-2" /> Chat
          </button>
          <button
            onClick={() => handleCallCustomer(job.customer?.phone || job.contactInfo)}
            className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-md border border-lime-300 text-lime-700 hover:bg-lime-50 transition-colors text-sm font-medium"
            disabled={!(job.customer?.phone || job.contactInfo)}
          >
            <Phone className="w-4 h-4 mr-2" /> Call Customer
          </button>
        </div>
      )}

      {(job.status === 'pending_quote' || (job.status === 'quoted' && editingQuote[job._id])) && (
        <div className="mt-auto p-4 border border-lime-300 bg-lime-50 rounded-lg flex-shrink-0">
          <p className="text-lime-800 font-semibold mb-2 flex items-center text-sm sm:text-base">
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />{' '}
            {job.status === 'pending_quote' ? 'Submit Your Quote:' : 'Edit Your Quote:'}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-[#2C2C2C]">₹</span>
            <input
              type="number"
              value={quoteInputs[job._id] || ''}
              onChange={(e) => handleQuoteInputChange(job._id, e.target.value)}
              placeholder="Enter your price"
              className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
            />
            <button
              onClick={() => handleQuoteSubmit(job._id)}
              disabled={isSubmittingQuote[job._id]}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm sm:text-base flex items-center justify-center"
            >
              {isSubmittingQuote[job._id] ? (
                <LoadingSpinner className="h-4 w-4 border-2 text-white" />
              ) : (
                'Submit'
              )}
            </button>
          </div>
          {job.quotation && job.status === 'pending_quote' && (
            <p className="text-xs text-gray-600 mt-2">
              AI Estimate: ₹{job.quotation}
            </p>
          )}
        </div>
      )}

      {job.status === 'quoted' && !editingQuote[job._id] && (
        <div className="mt-auto p-4 border border-lime-300 bg-lime-50 rounded-lg text-lime-800 flex justify-between items-center flex-shrink-0">
          <div>
            <p className="font-semibold flex items-center text-sm sm:text-base">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Your Quote Submitted:
            </p>
            <p className="text-xl sm:text-2xl font-bold mt-1">₹{job.estimatedPrice}</p>
            <p className="text-xs sm:text-sm mt-1">Waiting for customer acceptance.</p>
          </div>
          <button
            onClick={() => toggleEditQuote(job._id)}
            className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            title="Edit Quote"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      )}

      {job.status === 'accepted' && (
        <>
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="flex flex-col items-center text-center">
              <p className="text-emerald-800 font-semibold flex items-center text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Quote Accepted:
              </p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                ₹{job.estimatedPrice || job.quotation}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleConfirmCompleted(job._id)}
            disabled={isSendingOtp[job._id]}
            className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-colors flex items-center justify-center cursor-pointer text-base font-semibold flex-shrink-0"
          >
            {isSendingOtp[job._id] ? (
              <LoadingSpinner className="h-5 w-5 border-2 text-white" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm Completion & Send OTP
              </>
            )}
          </button>
        </>
      )}

      {job.status === 'pending_otp' && (
        <button
          onClick={() => handleConfirmCompleted(job._id)}
          disabled={isSendingOtp[job._id]}
          className="mt-auto w-full py-3 bg-teal-600 text-white rounded-xl shadow-md hover:bg-teal-700 transition-colors flex items-center justify-center cursor-pointer text-base font-semibold flex-shrink-0"
        >
          {isSendingOtp[job._id] ? (
            <LoadingSpinner className="h-5 w-5 border-2 text-white" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Resend OTP
            </>
          )}
        </button>
      )}

      {job.status === 'completed' && (
        <div className="mt-auto p-4 bg-gray-50 rounded-lg text-[#2C2C2C] text-center flex-shrink-0">
          <p className="font-semibold text-base sm:text-lg">Job Completed</p>
          <p className="text-sm sm:text-base">Thank you for your service!</p>
        </div>
      )}
    </div>
  );
};

export default InprogressJobCard;