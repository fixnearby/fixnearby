import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../lib/axios.js';
import {
  Wrench,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Shield,
  Loader,
  Send,
  AlertCircle,
  X
} from 'lucide-react';

const serviceIcons = {
  electronics: <Zap className="w-5 h-5" />,
  appliances: <Wrench className="w-5 h-5" />,
  plumbing: <Droplets className="w-5 h-5" />,
  electrical: <Zap className="w-5 h-5" />,
  carpentry: <Hammer className="w-5 h-5" />,
  painting: <Paintbrush className="w-5 h-5" />,
  automotive: <Shield className="w-5 h-5" />,
  hvac: <Wrench className="w-5 h-5" />,
  other: <Wrench className="w-5 h-5" />
};

const Showservices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { serviceCategory, userLocation } = location.state || {};

  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showServiceRequestForm, setShowServiceRequestForm] = useState(false);
  const [selectedRepairerForRequest, setSelectedRepairerForRequest] = useState(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [autoSubmitSuccess, setAutoSubmitSuccess] = useState(false);
  const [autoSubmitError, setAutoSubmitError] = useState(null);
  const [hasAttemptedAutoSubmit, setHasAttemptedAutoSubmit] = useState(false);

  const autoSubmitRequestSentRef = useRef(false);

  const allowedServiceTypes = useMemo(() => [
    'electronics', 'appliances', 'plumbing', 'electrical',
    'carpentry', 'painting', 'automotive', 'hvac', 'other'
  ], []);

  const autoSubmitServiceRequest = useCallback(async () => {
    console.log('autoSubmitServiceRequest called. hasAttemptedAutoSubmit (state):', hasAttemptedAutoSubmit, 'autoSubmitting (state):', autoSubmitting, 'autoSubmitRequestSentRef.current:', autoSubmitRequestSentRef.current);

    if (autoSubmitRequestSentRef.current) {
        console.log('autoSubmitServiceRequest: Request already sent via ref, returning.');
        return;
    }

    if (hasAttemptedAutoSubmit || autoSubmitting) {
        console.log('autoSubmitServiceRequest: Already attempted (state) or currently submitting (state), returning.');
        return;
    }

    autoSubmitRequestSentRef.current = true;

    setAutoSubmitting(true);
    setAutoSubmitError(null);
    setAutoSubmitSuccess(false);

    try {
      console.log('autoSubmitServiceRequest: Sending request...');
      const requestPayload = {
        title: `${serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)} Service Request`,
        serviceType: serviceCategory,
        description: `Service request for ${serviceCategory} at ${userLocation.fullAddress}. No immediate repairer found.`,
        locationData: userLocation,
        preferredTimeSlot: 'flexible',
        urgency: 'medium',
        repairerId: null
      };

      const response = await axiosInstance.post('/service-requests', requestPayload);

      if (response.status === 201 || response.data.success) {
        setAutoSubmitSuccess(true);
        console.log('Auto-submitted service request successfully:', response.data);
      } else {
        setAutoSubmitError(response.data?.message || 'Failed to auto-submit service request.');
        console.error('Auto-submission failed:', response.data);
        autoSubmitRequestSentRef.current = false;
      }
    } catch (err) {
      console.error('Error during auto-submission:', err.response?.data || err.message);
      setAutoSubmitError(err.response?.data?.message || 'An unexpected error occurred during auto-submission.');
      autoSubmitRequestSentRef.current = false;
    } finally {
      setAutoSubmitting(false);
      setHasAttemptedAutoSubmit(true);
      console.log('autoSubmitServiceRequest: Finished, hasAttemptedAutoSubmit set to true.');
    }
  }, [serviceCategory, userLocation, hasAttemptedAutoSubmit, autoSubmitting]);

  const fetchRepairers = useCallback(async () => {
    console.log('fetchRepairers called. hasAttemptedAutoSubmit:', hasAttemptedAutoSubmit, 'autoSubmitRequestSentRef.current:', autoSubmitRequestSentRef.current);

    if (!userLocation || !userLocation.pincode || !serviceCategory || !allowedServiceTypes.includes(serviceCategory.toLowerCase())) {
        setError("Invalid service category or location data is missing. Please go back and select a service and location.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    setRepairers([]);

    try {
      const response = await axiosInstance.get(`/user/dashboard?postalCode=${userLocation.pincode}&serviceType=${serviceCategory}`);
      setRepairers(response.data);

      if (response.data.length === 0 && !autoSubmitRequestSentRef.current) {
        console.log('fetchRepairers: No repairers found, attempting to auto-submit service request.');
        autoSubmitServiceRequest();
      } else if (response.data.length === 0 && autoSubmitRequestSentRef.current) {
        console.log('fetchRepairers: No repairers found, but auto-submit already sent via ref.');
      }

    } catch (err) {
      console.error('Error fetching repairers:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load available repairers.');
      if (!autoSubmitRequestSentRef.current) {
        console.log('Error fetching repairers, attempting to auto-submit service request as fallback.');
        autoSubmitServiceRequest();
      }
    } finally {
      setLoading(false);
    }
}, [userLocation, serviceCategory, autoSubmitRequestSentRef, autoSubmitServiceRequest, hasAttemptedAutoSubmit, allowedServiceTypes]);

  useEffect(() => {
    console.log('Initial useEffect for Showservices.jsx triggered.');
    if (userLocation && serviceCategory) {
      fetchRepairers();
    } else {
      console.log('Initial useEffect: Missing userLocation or serviceCategory, redirecting.');
      navigate('/user/dashboard', { replace: true });
    }
    return () => {};
  }, [fetchRepairers, userLocation, serviceCategory, navigate]);

  const openServiceRequestForm = (repairerId) => {
    setSelectedRepairerForRequest(repairerId);
    setDescriptionInput('');
    setSubmitSuccessMessage(null);
    setShowServiceRequestForm(true);
    setSubmitError(null);
  };

  const handleSubmitServiceRequest = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccessMessage(null);
    setIsSubmittingRequest(true);

    if (!descriptionInput) {
      setSubmitError("Please provide a description for your service request.");
      setIsSubmittingRequest(false);
      return;
    }
    if (!selectedRepairerForRequest) {
        setSubmitError("No repairer selected. Please select a repairer.");
        setIsSubmittingRequest(false);
        return;
    }

    try {
      console.log('handleSubmitServiceRequest: Sending request...');
      const response = await axiosInstance.post('/service-requests', {
        repairerId: selectedRepairerForRequest,
        title: `${serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)} Service Request`,
        serviceType: serviceCategory,
        description: descriptionInput,
        locationData: userLocation,
        preferredTimeSlot: 'flexible',
        urgency: 'medium'
      });

      if (response.status === 201 || response.data.success) {
        setSubmitSuccessMessage(`Service request submitted successfully for ${repairers.find(r => r._id === selectedRepairerForRequest)?.fullname}!`);
        setDescriptionInput('');
        setSelectedRepairerForRequest(null);
        setShowServiceRequestForm(false);
      } else {
        setSubmitError(response.data?.message || "Failed to submit service request.");
      }
    } catch (err) {
      console.error('Error creating service request:', err.response?.data || err.message);
      setSubmitError(err.response?.data?.message || 'An error occurred while submitting your request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (loading || autoSubmitting) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-700">
          {loading ? `Finding repairers for ${serviceCategory || 'your service'}...` : 'Saving your service request...'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {loading ? 'Please wait a moment.' : 'We are saving your request and will notify you when a repairer is available.'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center bg-white rounded-xl shadow-lg mt-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={() => navigate('/user/dashboard', { replace: true })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[80vh]">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Available Repairers for {serviceCategory ? serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1) : 'Your Service'}
      </h1>
      {userLocation && (
        <p className="text-lg text-gray-700 mb-8">
          Showing repairers for: <span className="font-semibold">{userLocation.fullAddress}</span> (Pincode: <span className="font-semibold">{userLocation.pincode}</span>)
        </p>
      )}

      {repairers.length > 0 ? (
        <>
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{submitError}</span>
            </div>
          )}
          {submitSuccessMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>{submitSuccessMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repairers.map(repairer => (
              <div
                key={repairer._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-gray-400">
                      {serviceIcons[serviceCategory.toLowerCase()] || <Wrench size={32} />}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold text-gray-900">{repairer.fullname}</h2>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(repairer.rating?.average || 0) ?
                              'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          ({repairer.rating?.count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{repairer.location?.address || 'Location not specified'} (Pincode: {repairer.location?.postalCode})</span>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {repairer.services && repairer.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-blue-50 px-3 py-1 rounded-full"
                        >
                          {serviceIcons[service.name.toLowerCase()] || <Wrench className="w-5 h-5" />}
                          <span className="ml-2 text-sm font-medium">
                            {service.name} (₹{service.price})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{repairer.experience || 0} years experience</span>
                    </div>

                    <button
                      onClick={() => openServiceRequestForm(repairer._id)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
                    >
                      Request Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showServiceRequestForm && selectedRepairerForRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Service Request</h2>
                <p className="text-gray-600 mb-4">
                  For: <span className="font-semibold">{repairers.find(r => r._id === selectedRepairerForRequest)?.fullname}</span>
                </p>
                <p className="text-gray-600 mb-4">
                  Service: <span className="font-semibold">{serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}</span>
                </p>
                <p className="text-gray-600 mb-4">
                  Location: <span className="font-semibold">{userLocation?.fullAddress}, {userLocation?.pincode}</span>
                </p>

                <form onSubmit={handleSubmitServiceRequest} className="space-y-4">
                  <div>
                    <label htmlFor="descriptionInput" className="block text-sm font-medium text-gray-700 mb-1">
                      Describe Your Issue
                    </label>
                    <textarea
                      id="descriptionInput"
                      rows="4"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., My kitchen sink is leaking, need a plumber to fix it urgently."
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      disabled={isSubmittingRequest}
                      required
                    ></textarea>
                  </div>

                  {submitError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl flex items-center space-x-2">
                      <AlertCircle size={20} />
                      <span>{submitError}</span>
                    </div>
                  )}
                  {submitSuccessMessage && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl flex items-center space-x-2">
                      <CheckCircle size={20} />
                      <span>{submitSuccessMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowServiceRequestForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      disabled={isSubmittingRequest}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingRequest ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center md:col-span-3 py-12 bg-white rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No immediate repairers found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any repairers available for your selected service ({serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}) in pincode {userLocation.pincode} right now.
          </p>

          {autoSubmitting && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Saving your request...</span>
            </div>
          )}
          {autoSubmitSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-xl inline-flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>Your request has been saved! We'll notify you when a repairer is available.</span>
            </div>
          )}
          {autoSubmitError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl inline-flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>Error saving request: {autoSubmitError}. Please try again later.</span>
            </div>
          )}

          {!autoSubmitting && !autoSubmitSuccess && !autoSubmitError && hasAttemptedAutoSubmit && (
            <div className="mt-4 p-3 bg-gray-100 text-gray-700 rounded-xl inline-flex items-center space-x-2">
                <span>We've attempted to save your request. If no confirmation, please retry.</span>
            </div>
          )}

          <button
            onClick={() => navigate('/user/dashboard', { replace: true })}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      )}

      {showServiceRequestForm && selectedRepairerForRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Service Request</h2>
            <p className="text-gray-600 mb-4">
              For: <span className="font-semibold">{repairers.find(r => r._id === selectedRepairerForRequest)?.fullname}</span>
            </p>
            <p className="text-gray-600 mb-4">
              Service: <span className="font-semibold">{serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}</span>
            </p>
            <p className="text-gray-600 mb-4">
              Location: <span className="font-semibold">{userLocation?.fullAddress}, {userLocation?.pincode}</span>
            </p>

            <form onSubmit={handleSubmitServiceRequest} className="space-y-4">
              <div>
                <label htmlFor="descriptionInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Describe Your Issue
                </label>
                <textarea
                  id="descriptionInput"
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., My kitchen sink is leaking, need a plumber to fix it urgently."
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  disabled={isSubmittingRequest}
                  required
                ></textarea>
              </div>

              {submitError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl flex items-center space-x-2">
                  <AlertCircle size={20} />
                  <span>{submitError}</span>
                </div>
              )}
              {submitSuccessMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl flex items-center space-x-2">
                  <CheckCircle size={20} />
                  <span>{submitSuccessMessage}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowServiceRequestForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isSubmittingRequest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingRequest ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showservices;