import React, { useState, useEffect } from 'react';
import { LogOut, User, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { useNavigate  } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate()
  const [paidServices, setPaidServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingService, setCompletingService] = useState(null);

  useEffect(() => {
    fetchPaidServices();
  }, []);

  const fetchPaidServices = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get('/admin/paid-services');

      if (response.status!==200) {
        throw new Error('Failed to fetch services');
      }

      const data =  response.data;
      setPaidServices(data.services || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/admin/logout');
      
      localStorage.removeItem('adminToken');
      navigate('/')
      
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
  };

  const handleCompleteService = async (serviceId) => {
    try {
      setCompletingService(serviceId);
      
      const response = await axiosInstance.put(`/admin/complete-service/${serviceId}`);

      if (response.status!==200 ) {
        throw new Error('Failed to complete service');
      }

      // Refresh the services list
      await fetchPaidServices();
      alert('Service marked as complete successfully!');
    } catch (err) {
      alert('Error completing service: ' + err.message);
    } finally {
      setCompletingService(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
            
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50  border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Customer Paid Services</h2>
          <p className="text-gray-600">Manage services that have been paid by customers</p>
        </div>

        {paidServices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No paid services found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {paidServices.map((service) => (
              <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Service Request #{service._id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Status: <span className="capitalize font-medium text-green-600">{service.status}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleCompleteService(service._id)}
                      disabled={completingService === service._id || service.status === 'complete'}
                      className={`flex items-center px-4 py-2 rounded-md text-sm cursor-pointer font-medium transition-colors ${
                        service.status === 'complete'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {completingService === service._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {service.status === 'complete' ? 'Completed' : 'Mark Complete'}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Service Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Description:</strong> {service.description || 'N/A'}</p>
                        <p><strong>Location:</strong> {service.location.address || 'N/A'}</p>
                        <p><strong>Created:</strong> {new Date(service.createdAt).toLocaleDateString()}</p>
                        <p><strong>Amount:</strong> ₹{service.estimatedPrice || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Repairer Details */}
                    {service.repairer && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Assigned Repairer</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <User className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                              {service.repairer.fullname || 'N/A'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{service.repairer.phone || 'N/A'}</span>
                            </div>
                            
                            
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium">UPI ID: {service.repairer.upiId || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Details */}
                  {service.customer && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <p><strong>Name:</strong> {service.customer.fullname || 'N/A'}</p>
                        <p><strong>Phone:</strong> {service.customer.phone || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;