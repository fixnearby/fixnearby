// frontend/src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getNearbyJobs = async () => {
  try {
    const response = await api.get('/repairer/jobs/nearby');
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
    const response = await api.post(`/repairer/jobs/${jobId}/accept`);
    return response.data;
  } catch (error) {
    console.error("API Error: acceptJob:", error.response?.data || error.message);
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

export const getConversationMessages = async (serviceId) => {
  try {
    const response = await api.get(`/repairer/conversations/${serviceId}/messages`);
    return response.data;
  } catch (error) {
    console.error("API Error: getConversationMessages:", error.response?.data || error.message);
    throw error;
  }
};

export const sendMessage = async (conversationId, text) => {
  try {
    const response = await api.post('/repairer/messages/send', { conversationId, text });
    return response.data;
  } catch (error) {
    console.error("API Error: sendMessage:", error.response?.data || error.message);
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

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/repairer/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("API Error: markNotificationAsRead:", error.response?.data || error.message);
    throw error;
  }
};

export const getOtpRepairer = async (email) => {
  try {
    const response = await api.post('/repairer/getotp', { email });
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
