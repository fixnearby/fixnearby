import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REPAIRER Service Calls ---

export const getNearbyJobs = async () => {
  try {
    const response = await api.get('/repairer/nearby-jobs');
    return response.data;
  } catch (error) {
    console.error("API Error: getNearbyJobs:", error.response?.data || error.message);
    throw error;
  }
};

export const getRepairerDashboardStats = async () => {
  try {
    const response = await api.get('/repairer/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error("API Error: getRepairerDashboardStats:", error.response?.data || error.message);
    throw error;
  }
};

export const getRepairerRecentActivity = async () => {
  try {
    const response = await api.get('/repairer/recent-activity');
    return response.data;
  } catch (error) {
    console.error("API Error: getRepairerRecentActivity:", error.response?.data || error.message);
    throw error;
  }
};

export const acceptJob = async (jobId) => {
  try {
    const response = await api.post(`/repairer/accept-job/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("API Error: acceptJob:", error.response?.data || error.message);
    throw error;
  }
};

export const completeJob = async (jobId, completionDetails) => {
  try {
    const response = await api.put(`/service-requests/complete/${jobId}`, completionDetails);
    return response.data;
  } catch (error) {
    console.error("API Error: completeJob:", error.response?.data || error.message);
    throw error;
  }
};

export const cancelRepairerJob = async (jobId, cancelDetails) => {
  try {
    const response = await api.put(`/service-requests/cancel-by-repairer/${jobId}`, cancelDetails);
    return response.data;
  } catch (error) {
    console.error("API Error: cancelRepairerJob:", error.response?.data || error.message);
    throw error;
  }
};

export const getRepairerProfileDetails = async () => {
  try {
    const response = await api.get('/repairer/profile');
    return response.data;
  } catch (error) {
    console.error("API Error: getRepairerProfileDetails:", error.response?.data || error.message);
    throw error;
  }
};

export const updateRepairerProfile = async (profileData) => {
  try {
    const response = await api.put('/repairer/profile', profileData);
    return response.data;
  } catch (error) {
    console.error("API Error: updateRepairerProfile:", error.response?.data || error.message);
    throw error;
  }
};

export const updateRepairerSettings = async (settingsData) => {
  try {
    const response = await api.put('/repairer/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error("API Error: updateRepairerSettings:", error.response?.data || error.message);
    throw error;
  }
};

export const getRepairerAnalytics = async () => {
  try {
    const response = await api.get('/repairer/analytics');
    return response.data;
  } catch (error) {
    console.error("API Error: getRepairerAnalytics:", error.response?.data || error.message);
    throw error;
  }
};

export const getRepairerConversations = async () => {
  try {
    const response = await api.get('/repairer/conversations');
    return response.data;
  } catch (error) {
    console.error("API Error: getRepairerConversations:", error.response?.data || error.message);
    throw error;
  }
};

export const getRepairerConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/repairer/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    console.error("API Error: getRepairerConversationMessages:", error.response?.data || error.message);
    throw error;
  }
};

export const getRepairerNotifications = async () => {
  try {
    const response = await api.get('/repairer/notifications');
    return response.data;
  } catch (error) {
    console.error("API Error: getRepairerNotifications:", error.response?.data || error.message);
    throw error;
  }
};

export const markRepairerNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/repairer/notifications/read/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("API Error: markRepairerNotificationAsRead:", error.response?.data || error.message);
    throw error;
  }
};

export const getOtpRepairer = async (email) => {
  try {
    const response = await api.post('/repairer/get-otp', { email });
    return response.data;
  } catch (error) {
    console.error('API Error (getOtpRepairer):', error.response?.data || error.message);
    throw error;
  }
};

export const verifyOtpRepairer = async (email, otp) => {
  try {
    const response = await api.post('/repairer/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    console.error('API Error (verifyOtpRepairer):', error.response?.data || error.message);
    throw error;
  }
};

export const signupRepairer = async (signupData) => {
  try {
    const response = await api.post('/repairer/signup', signupData);
    return response.data;
  } catch (error) {
    console.error('API Error (signupRepairer):', error.response?.data || error.message);
    throw error;
  }
};

export const loginRepairer = async (email, password) => {
  try {
    const response = await api.post('/repairer/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('API Error (loginRepairer):', error.response?.data || error.message);
    throw error;
  }
};

export const logoutRepairer = async () => {
  try {
    const response = await api.post('/repairer/logout');
    return response.data;
  } catch (error) {
    console.error('API Error (logoutRepairer):', error.response?.data || error.message);
    throw error;
  }
};

// --- USER Service Calls ---

export const getOtpUser = async (email) => {
  try {
    const response = await api.post('/user/get-otp', { email });
    return response.data;
  } catch (error) {
    console.error('API Error (getOtpUser):', error.response?.data || error.message);
    throw error;
  }
};

export const verifyOtpUser = async (email, otp) => {
  try {
    const response = await api.post('/user/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    console.error('API Error (verifyOtpUser):', error.response?.data || error.message);
    throw error;
  }
};

export const signupUser = async (signupData) => {
  try {
    const response = await api.post('/user/signup', signupData);
    return response.data;
  } catch (error) {
    console.error('API Error (signupUser):', error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/user/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('API Error (loginUser):', error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/user/logout');
    return response.data;
  } catch (error) {
    console.error('API Error (logoutUser):', error.response?.data || error.message);
    throw error;
  }
};

export const getUserDashboardStats = async () => {
  try {
    const response = await api.get('/user/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error("API Error: getUserDashboardStats:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserRecentActivity = async () => {
  try {
    const response = await api.get('/user/recent-activity');
    return response.data;
  } catch (error) {
    console.error("API Error: getUserRecentActivity:", error.response?.data || error.message);
    throw error;
  }
};

export const requestService = async (serviceData) => {
  try {
    const response = await api.post('/service-requests', serviceData);
    return response.data;
  } catch (error) {
    console.error("API Error: requestService:", error.response?.data || error.message);
    throw error;
  }
};

export const getInProgressServices = async () => {
  try {
    const response = await api.get('/user/in-progress-services');
    return response.data;
  } catch (error) {
    console.error("API Error: getInProgressServices:", error.response?.data || error.message);
    throw error;
  }
};

export const getPendingServices = async () => {
  try {
    const response = await api.get('/user/pending-services');
    return response.data;
  } catch (error) {
    console.error("API Error: getPendingServices:", error.response?.data || error.message);
    throw error;
  }
};

export const cancelUserJob = async (jobId) => {
  try {
    const response = await api.put(`/user/cancel-job/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("API Error: cancelUserJob:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserConversations = async () => {
  try {
    const response = await api.get('/user/conversations');
    return response.data;
  } catch (error) {
    console.error("API Error: getUserConversations:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/user/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    console.error("API Error: getUserConversationMessages:", error.response?.data || error.message);
    throw error;
  }
};
