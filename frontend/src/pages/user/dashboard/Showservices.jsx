import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../lib/axios.js';


import RepairerCard from '../../../components/ShowServices/RepairerCard.jsx';
import ServiceRequestModal from '../../../components/ShowServices/ServiceRequestModal.jsx';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../../components/ErrorMessage.jsx';
import StatusMessage from '../../../components/StatusMessage.jsx';

const Showservices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { serviceCategory, userLocation } = location.state || {};

  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showServiceRequestForm, setShowServiceRequestForm] = useState(false);
  const [selectedRepairerForRequest, setSelectedRepairerForRequest] = useState(null); // Now stores the full repairer object
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
    const repairer = repairers.find(r => r._id === repairerId);
    setSelectedRepairerForRequest(repairer); // Store the full repairer object
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
        repairerId: selectedRepairerForRequest._id, // Use _id from the stored object
        title: `${serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)} Service Request`,
        serviceType: serviceCategory,
        description: descriptionInput,
        locationData: userLocation,
        preferredTimeSlot: 'flexible',
        urgency: 'medium'
      });

      if (response.status === 201 || response.data.success) {
        setSubmitSuccessMessage(`Service request submitted successfully for ${selectedRepairerForRequest.fullname}!`);
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
      <LoadingSpinner
        message={loading ? `Finding repairers for ${serviceCategory || 'your service'}...` : 'Saving your service request...'}
        subMessage={loading ? 'Please wait a moment.' : 'We are saving your request and will notify you when a repairer is available.'}
      />
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
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
            <StatusMessage type="error" message={submitError} className="mb-4" />
          )}
          {submitSuccessMessage && (
            <StatusMessage type="success" message={submitSuccessMessage} className="mb-4" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repairers.map(repairer => (
              <RepairerCard
                key={repairer._id}
                repairer={repairer}
                serviceCategory={serviceCategory}
                openServiceRequestForm={openServiceRequestForm}
              />
            ))}
          </div>

          <ServiceRequestModal
            showModal={showServiceRequestForm}
            onClose={() => setShowServiceRequestForm(false)}
            onSubmit={handleSubmitServiceRequest}
            descriptionInput={descriptionInput}
            setDescriptionInput={setDescriptionInput}
            isSubmitting={isSubmittingRequest}
            submitError={submitError}
            submitSuccessMessage={submitSuccessMessage}
            selectedRepairer={selectedRepairerForRequest}
            serviceCategory={serviceCategory}
            userLocation={userLocation}
          />
        </>
      ) : (
        <div className="text-center md:col-span-3 py-12 bg-white rounded-xl shadow-lg">
          <StatusMessage type="info" message="No immediate repairers found" className="mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No immediate repairers found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any repairers available for your selected service ({serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}) in pincode {userLocation.pincode} right now.
          </p>

          {autoSubmitting && (
            <StatusMessage type="loading" message="Saving your request..." className="inline-flex" />
          )}
          {autoSubmitSuccess && (
            <StatusMessage type="success" message="Your request has been saved! We'll notify you when a repairer is available." className="inline-flex mt-4" />
          )}
          {autoSubmitError && (
            <StatusMessage type="error" message={`Error saving request: ${autoSubmitError}. Please try again later.`} className="inline-flex mt-4" />
          )}

          {!autoSubmitting && !autoSubmitSuccess && !autoSubmitError && hasAttemptedAutoSubmit && (
            <StatusMessage type="info" message="We've attempted to save your request. If no confirmation, please retry." className="inline-flex mt-4" />
          )}

          <button
            onClick={() => navigate('/user/dashboard', { replace: true })}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Showservices;