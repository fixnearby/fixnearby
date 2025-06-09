import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { axiosInstance } from '../../../lib/axios';
import { 
  Clock, 
  XCircle, 
  Info, 
  Calendar, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const statusIcons = {
  requested: <Clock className="w-5 h-5 text-yellow-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />
};

const Pendingservice = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  console.log('User:', user);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get('/user/service-requests?status=requested');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const cancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      await axiosInstance.patch(`/api/user/service-requests/${requestId}`, {
        status: 'cancelled'
      });
      setRequests(requests.filter(req => req._id !== requestId));
      alert('Request cancelled successfully');
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Service Requests</h1>
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-600">
            You don't have any pending service requests. Create a new request to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repairer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map(request => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {statusIcons[request.status] || <Info className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.title}</div>
                          <div className="text-sm text-gray-500">{request.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.repairer?.fullname || 'Not assigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => cancelRequest(request._id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pendingservice;