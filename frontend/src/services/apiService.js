// frontend/src/services/apiService.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore.js'; 
const API_BASE_URL = 'http://localhost:3000'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Interceptor to attach authentication token to requests
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const getNearbyJobs = async () => {
  try {
    const response = await api.get('/api/repairer/jobs/nearby'); // Corrected endpoint
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby jobs:", error.response?.data || error.message);
    throw error; 
  }
};


export const getRepairerDashboardStats = async () => {
  try {
    const response = await api.get('/api/repairer/dashboard-stats'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error.response?.data || error.message);
    throw error;
  }
};

export const getRepairerRecentActivity = async () => {
  try {
    const response = await api.get('/api/repairer/recent-activity'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error.response?.data || error.message);
    throw error;
  }
};

export const acceptJob = async (jobId, repairerId) => {
  try {
    const response = await api.post(`/api/repairer/jobs/${jobId}/accept`, { repairerId }); // Corrected endpoint
    return response.data;
  } catch (error) {
    console.error(`Error accepting job ${jobId}:`, error.response?.data || error.message);
    throw error;
  }
};

export default api;
