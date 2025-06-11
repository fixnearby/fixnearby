// frontend/src/pages/repairer/dashboard/Maindashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore.js'; // <--- CORRECTED/CONFIRMED PATH

// Import segregated components
import Header from '../../../components/RepairerDashboard/Header.jsx';
import OnlineDashboardContent from '../../../components/RepairerDashboard/OnlineDashboardContent.jsx';
import OfflineDashboardContent from '../../../components/RepairerDashboard/OfflineDashboardContent.jsx';

// Import API functions
import {
  getNearbyJobs,
  getRepairerDashboardStats,
  getRepairerRecentActivity,
  acceptJob,
  getRepairerNotifications
} from '../../../services/apiService.js';
import { axiosInstance } from '../../../lib/axios.js';
import toast from 'react-hot-toast';

// Helper function for urgency color (kept here as it's specific to job display)
const getUrgencyColor = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const RepairerMainDashboard = () => {
  const navigate = useNavigate();
  // Ensure useAuthStore returns an object before destructuring
  const { repairer, clearRepairer, clearUser, clearAdmin } = useAuthStore();

  const [isOnline, setIsOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // State for fetched data
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Loading and error states
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null); // Initialize as null
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [errorActivity, setErrorActivity] = useState(null); // Initialize as null
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const displayName = repairer?.fullname || 'Repairer';
  const repairerId = repairer?._id;

  // --- API Fetching Functions ---
  const fetchNearbyJobs = useCallback(async () => {
    if (!isOnline) {
        setJobs([]);
        setLoadingJobs(false);
        return;
    }
    setLoadingJobs(true);
    setErrorJobs(null);
    try {
      const data = await getNearbyJobs();
      setJobs(data);
    } catch (err) {
      setErrorJobs("Failed to load nearby jobs.");
      console.error("Error fetching nearby jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  }, [isOnline]);

  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const data = await getRepairerDashboardStats();
      setStats([
        { title: "Jobs Completed", value: data.jobsCompleted || "0", change: data.jobsCompletedChange || "N/A", icon: 'CheckCircle' },
        { title: "Earnings This Month", value: `$${data.earningsThisMonth?.toLocaleString() || "0"}`, change: data.earningsChange || "N/A", icon: 'DollarSign' },
        { title: "Average Rating", value: data.averageRating?.toFixed(1) || "0.0", change: data.ratingChange || "N/A", icon: 'Star' },
        { title: "Active Jobs", value: data.activeJobs || "0", change: data.activeJobsChange || "N/A", icon: 'Target' }
      ]);
    } catch (err) {
      setErrorStats("Failed to load dashboard stats.");
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    setLoadingActivity(true);
    setErrorActivity(null);
    try {
      const data = await getRepairerRecentActivity();
      setRecentActivity(data);
    } catch (err) {
      setErrorActivity("Failed to load recent activity.");
      console.error("Error fetching recent activity:", err);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const notifications = await getRepairerNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      setUnreadNotificationCount(unreadCount);
    } catch (err) {
      console.error("Error fetching unread notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);


  // --- Effects to trigger fetching ---
  useEffect(() => {
    if (isOnline) {
      fetchNearbyJobs();
    } else {
      setJobs([]);
    }
  }, [isOnline, fetchNearbyJobs]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
    fetchUnreadNotifications();
  }, [fetchDashboardStats, fetchRecentActivity, fetchUnreadNotifications]);

  // --- Job Acceptance Handler ---
  const handleAcceptJob = async (jobId) => {
    console.log(`Attempting to accept job: ${jobId}`);
    if (!repairerId) {
      alert("Repairer ID not available. Please log in again.");
      return;
    }
    try {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      await acceptJob(jobId);
      alert('Job accepted successfully!');
      fetchDashboardStats();
      fetchRecentActivity();
      fetchUnreadNotifications();
    } catch (error) {
      alert('Failed to accept job. Please try again.');
      console.error('Accept job error:', error);
      fetchNearbyJobs();
    }
  };


  // --- Navigation Handlers ---
  const handleLogout = async () => {
    const res = axiosInstance.post('/repairer/logout');
        if (res.status === 200) {
            toast.success('Logged out successfully!');
        } else {   
            toast.error('Failed to logout. Please try again.');
        }
        window.location.reload()
  };

  const handleSettingsClick = () => {
    console.log("Settings button clicked. Navigating to /repairer/settings");
    navigate('/repairer/settings');
  };

  const handleNotificationsClick = () => {
    console.log("Notifications button clicked. Navigating to /repairer/notifications");
    navigate('/repairer/notifications');
    fetchUnreadNotifications();
  };

  const handleProfileClick = () => {
    console.log("Profile button clicked. Navigating to /repairer/profile");
    navigate('/repairer/profile');
  };

  const handleViewAnalyticsClick = () => {
    console.log("View Analytics button clicked. Navigating to /repairer/analytics");
    navigate('/repairer/analytics');
  };

  const handleMessagesClick = () => {
    console.log("Messages button clicked. Navigating to /repairer/messages");
    navigate('/repairer/messages');
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header
        displayName={displayName}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
        onNotificationsClick={handleNotificationsClick}
        onProfileClick={handleProfileClick}
        unreadNotificationCount={unreadNotificationCount}
        loadingNotifications={loadingNotifications}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isOnline ? (
          <OnlineDashboardContent
            jobs={jobs}
            loadingJobs={loadingJobs}
            errorJobs={errorJobs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            handleAcceptJob={handleAcceptJob}
            getUrgencyColor={getUrgencyColor}
          />
        ) : (
          <OfflineDashboardContent
            displayName={displayName}
            stats={stats}
            loadingStats={loadingStats}
            errorStats={errorStats}
            recentActivity={recentActivity}
            loadingActivity={loadingActivity}
            errorActivity={errorActivity}
            onViewAnalyticsClick={handleViewAnalyticsClick}
            onManageProfileClick={handleProfileClick}
            onMessagesClick={handleMessagesClick}
          />
        )}
      </div>
    </div>
  );
};

export default RepairerMainDashboard;