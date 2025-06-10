//frontend/src/pages/user/dashboard/Inprogress.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore.js';
import { axiosInstance } from '../../../lib/axios.js';
import {
  Wrench,
  MessageSquare,
  Phone,
  Check,
  Clock,
  MapPin,
  AlertCircle,
  Loader,
  User,
  XCircle,
  CheckCircle
} from 'lucide-react';

const Inprogress = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const { user } = useAuthStore();

  const fetchInProgressRequests = useCallback(async () => {
    if (!user || !user._id) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/service-requests/user/my-requests?statusFilter=in_progress');
      setRequests(response.data.data);
    } catch (err) {
      console.error('Error fetching in-progress requests:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load your in-progress service requests.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInProgressRequests();
  }, [fetchInProgressRequests]);

  const confirmCompletion = async (requestId) => {
    if (!window.confirm('Confirm that this service has been completed by the repairer?')) {
      return;
    }

    setActionMessage(null);
    try {
      const response = await axiosInstance.put(`/service-requests/user/${requestId}/status`, {
        status: 'completed'
      });

      if (response.status === 200 || response.data.success) {
        fetchInProgressRequests();
        setActionMessage({ type: 'success', text: 'Service confirmed as completed! Thank you.' });
      } else {
        setActionMessage({ type: 'error', text: response.data?.message || 'Failed to confirm service completion.' });
      }
    } catch (err) {
      console.error('Error confirming service completion:', err.response?.data || err.message);
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred while confirming completion.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="ml-3 text-lg text-gray-700">Loading your active services...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Services in Progress</h1>
      </div>

      {actionMessage && (
        <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
          actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="ml-auto text-current">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="text-center py-6 bg-red-100 text-red-700 rounded-xl shadow-lg mb-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {requests.length === 0 && !loading && !error ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No active services</h3>
          <p className="text-gray-600">
            You don't have any services currently in progress. Create a new service request to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(request => (
            <div key={request.id || request._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{request.title}</h2>
                    <p className="text-gray-600 mt-1">{request.description}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    In Progress
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center mb-3">
                    <Wrench className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="font-medium">Service Type:</span>
                    <span className="ml-2 capitalize">{request.serviceType}</span>
                  </div>

                  <div className="flex items-center mb-3">
                    <Clock className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="font-medium">Requested:</span>
                    <span className="ml-2">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{request.location.fullAddress}, {request.location.pincode}</span>
                  </div>

                  {request.repairer && (
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 text-gray-500 mr-2" />
                      <div>
                        <div className="font-medium">Repairer: {request.repairer.fullname}</div>
                        <div className="text-sm text-gray-600">Phone: {request.repairer.phone || 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6 space-x-2">
                  <button className="flex items-center text-blue-600 hover:text-blue-800 p-2 rounded-md">
                    <MessageSquare className="w-5 h-5 mr-1" /> Message
                  </button>
                  {request.repairer?.phone && (
                    <a
                      href={`tel:${request.repairer.phone}`}
                      className="flex items-center text-gray-600 hover:text-gray-800 p-2 rounded-md"
                    >
                      <Phone className="w-5 h-5 mr-1" /> Call Repairer
                    </a>
                  )}
                  <button
                    onClick={() => confirmCompletion(request.id || request._id)}
                    className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-5 h-5 mr-1" /> Confirm Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inprogress;