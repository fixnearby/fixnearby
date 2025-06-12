// frontend/src/services/apiService.js

import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast'; 
const apiRequest = async (method, url, data = {}, headers = {}) => {
  try {
    const response = await axiosInstance({ 
      method,
      url,
      data: method !== 'get' ? data : undefined,
      params: method === 'get' ? data : undefined, 
      headers,
    });
    return response.data; 
  } catch (error) {
  
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    console.error(`API Error: ${method.toUpperCase()} ${url}:`, errorMessage);
 
    toast.error(errorMessage);
    throw error; 
  }
};



export const getNearbyJobs = async () => apiRequest('get', '/repairer/nearby-jobs');
export const getRepairerDashboardStats = async () => apiRequest('get', '/repairer/dashboard-stats');
export const getRepairerRecentActivity = async () => apiRequest('get', '/repairer/recent-activity');
export const acceptJob = async (jobId) => apiRequest('post', `/repairer/accept-job/${jobId}`);
export const completeJob = async (jobId, completionDetails) => apiRequest('put', `/service-requests/complete/${jobId}`, completionDetails);
export const cancelRepairerJob = async (jobId, cancelDetails) => apiRequest('put', `/service-requests/cancel-by-repairer/${jobId}`, cancelDetails);
export const getRepairerProfileDetails = async () => apiRequest('get', '/repairer/profile');
export const updateRepairerProfile = async (profileData) => apiRequest('put', '/repairer/profile', profileData);
export const updateRepairerSettings = async (settingsData) => apiRequest('put', '/repairer/settings', settingsData);
export const getRepairerAnalytics = async () => apiRequest('get', '/repairer/analytics');
export const getRepairerConversations = async () => apiRequest('get', '/repairer/conversations');
export const getRepairerConversationMessages = async (conversationId) => apiRequest('get', `/repairer/conversations/${conversationId}/messages`);
export const getRepairerNotifications = async () => apiRequest('get', '/repairer/notifications');
export const markRepairerNotificationAsRead = async (notificationId) => apiRequest('put', `/repairer/notifications/read/${notificationId}`);
export const getOtpRepairer = async (email) => apiRequest('post', '/repairer/get-otp', { email });
export const verifyOtpRepairer = async (email, otp) => apiRequest('post', '/repairer/verify-otp', { email, otp });
export const signupRepairer = async (signupData) => apiRequest('post', '/repairer/signup', signupData);
export const loginRepairer = async (email, password) => apiRequest('post', '/repairer/login', { email, password });
export const logoutRepairer = async () => apiRequest('post', '/repairer/logout')
export const getOtpUser = async (email) => apiRequest('post', '/user/get-otp', { email });
export const verifyOtpUser = async (email, otp) => apiRequest('post', '/user/verify-otp', { email, otp });
export const signupUser = async (signupData) => apiRequest('post', '/user/signup', signupData);
export const loginUser = async (email, password) => apiRequest('post', '/user/login', { email, password });
export const logoutUser = async () => apiRequest('post', '/user/logout');
export const getUserDashboardStats = async () => apiRequest('get', '/user/dashboard-stats');
export const getUserRecentActivity = async () => apiRequest('get', '/user/recent-activity');
export const requestService = async (serviceData) => apiRequest('post', '/service-requests', serviceData);
export const getInProgressServices = async () => apiRequest('get', '/user/in-progress-services');
export const getPendingServices = async () => apiRequest('get', '/user/pending-services');
export const cancelUserJob = async (jobId) => apiRequest('put', `/user/cancel-job/${jobId}`);
export const getUserConversations = async () => apiRequest('get', '/user/conversations');
export const getUserConversationMessages = async (conversationId) => apiRequest('get', `/user/conversations/${conversationId}/messages`);
export const checkAuthStatus = () => apiRequest('get', '/check-auth'); 

