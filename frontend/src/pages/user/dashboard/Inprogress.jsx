import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { axiosInstance } from '../../../lib/axios';
import { 
  Wrench, 
  MessageSquare, 
  Phone, 
  Check, 
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';

const Inprogress = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  console.log('User:', user);

  useEffect(() => {
    const fetchInProgressRequests = async () => {
      try {
        const response = await axiosInstance.get('/user/service-requests?status=in_progress');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching in-progress requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInProgressRequests();
  }, []);

  const markAsCompleted = async (requestId) => {
    if (!window.confirm('Mark this service as completed?')) return;
    
    try {
      await axiosInstance.patch(`/api/user/service-requests/${requestId}`, {
        status: 'completed'
      });
      setRequests(requests.filter(req => req._id !== requestId));
      alert('Service marked as completed');
    } catch (error) {
      console.error('Error completing service:', error);
      alert('Failed to mark service as completed');
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
        <h1 className="text-3xl font-bold text-gray-900">Services in Progress</h1>
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No active services</h3>
          <p className="text-gray-600">
            You don't have any services in progress. Check your pending requests or create a new service.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(request => (
            <div key={request._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                    <span className="ml-2">{request.location.address}</span>
                  </div>
                  
                  {request.repairer && (
                    <div className="flex items-center mb-3">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2" />
                      <div>
                        <div className="font-medium">{request.repairer.fullname}</div>
                        <div className="text-sm text-gray-600">Repairer</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  <button className="flex items-center text-blue-600 hover:text-blue-800">
                    <MessageSquare className="w-4 h-4 mr-1" /> Message
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-gray-800">
                    <Phone className="w-4 h-4 mr-1" /> Call
                  </button>
                  <button 
                    onClick={() => markAsCompleted(request._id)}
                    className="flex items-center text-green-600 hover:text-green-800"
                  >
                    <Check className="w-4 h-4 mr-1" /> Mark as Completed
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