import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore.js';

import Header from '../../../components/RepairerDashboard/Header.jsx';
import OnlineDashboardContent from '../../../components/RepairerDashboard/OnlineDashboardContent.jsx';
import OfflineDashboardContent from '../../../components/RepairerDashboard/OfflineDashboardContent.jsx';

import {
  getNearbyJobs,
  getRepairerDashboardStats,
  getRepairerRecentActivity,
  acceptJob,
  getRepairerNotifications,
  logoutRepairer
} from '../../../services/apiService.js';
import toast from 'react-hot-toast';

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
  const { repairer, clearRepairer, clearUser, clearAdmin } = useAuthStore();

  const [isOnline, setIsOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [errorActivity, setErrorActivity] = useState(null);

  const displayName = repairer?.fullname || 'Repairer';
  const repairerId = repairer?._id;

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
      toast.error("Failed to load nearby jobs.");
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
        { title: "Earnings", value: `₹${data.earningsThisMonth?.toLocaleString() || "0"}`, change: data.earningsChange || "N/A", icon: 'IndianRupee' },
        { title: "Average Rating", value: data.averageRating?.toFixed(1) || "0.0", change: data.ratingChange || "N/A", icon: 'Star' },
        { title: "Active Jobs", value: data.activeJobs || "0", change: data.activeJobsChange || "N/A", icon: 'Target' }
      ]);
    } catch (err) {
      setErrorStats("Failed to load dashboard stats.");
      console.error("Error fetching dashboard stats:", err);
      toast.error("Failed to load dashboard stats.");
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
      toast.error("Failed to load recent activity.");
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const notifications = await getRepairerNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      setUnreadNotificationCount(unreadCount);
    } catch (err) {
      console.error("Error fetching unread notifications:", err);
    } 
  }, []);

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

  const handleAcceptJob = async (jobId) => {
    if (!repairerId) {
      toast.error("Repairer ID not available. Please log in again.");
      throw new Error("Authentication error: Repairer ID not available.");
    }
    try {
      const response = await acceptJob(jobId, { status: 'accept_request_for_quote' });
      toast.success('Job request accepted! Please provide your quote on the In Progress page.');

      fetchDashboardStats();
      fetchRecentActivity();
      fetchUnreadNotifications();

      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));

      navigate('/repairer/inprogress');

      return response;
    } catch (error) {
      console.error('Accept job error in RepairerMainDashboard:', error);

      let errorMessage = 'Failed to accept job. An unexpected error occurred. Please try again.';
      if (error.response && error.response.data) {
          const { message, code } = error.response.data;

          switch (code) {
              case 'MAX_JOBS_REACHED':
                  errorMessage = message;
                  break;
              case 'JOB_NOT_FOUND':
                  errorMessage = 'This job is no longer available.';
                  break;
              case 'UNAUTHORIZED':
                  errorMessage = 'You are not authorized to accept this job.';
                  break;
              case 'INVALID_STATUS_TRANSITION':
                  errorMessage = message;
                  break;
              case 'JOB_ALREADY_ASSIGNED':
                  errorMessage = 'This job has already been accepted by another repairer or is no longer available.';
                  break;
              case 'JOB_ALREADY_ACCEPTED_BY_YOU':
                  errorMessage = 'You have already accepted this job.';
                  break;
              case 'JOB_CANCELLED':
                  errorMessage = 'This job has been cancelled by the customer.';
                  break;
              case 'MISSING_REQUIRED_FIELDS':
                  errorMessage = 'Required information is missing. Please contact support.';
                  break;
              case 'INVALID_STATUS_FOR_ENDPOINT':
                  errorMessage = 'An internal error occurred regarding the job status update. Please refresh and try again.';
                  break;
              case 'FAILED_SEND_SMS':
                  errorMessage = 'Job accepted, but failed to send SMS notification to customer.';
                  break;
              default:
                  errorMessage = message || 'Failed to accept job due to an unknown issue.';
          }
      }
      
      if (error.response?.data?.code !== 'MAX_JOBS_REACHED') {
          toast.error(errorMessage);
      }

      fetchNearbyJobs();

      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutRepairer();
      toast.success('Logged out successfully!');
      clearRepairer();
      clearUser();
      clearAdmin();
      navigate('/repairer/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to logout. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/repairer/settings');
  };

  const handleNotificationsClick = () => {
    navigate('/repairer/notifications');
    fetchUnreadNotifications();
  };

  const handleProfileClick = () => {
    navigate('/repairer/profile');
  };

  const handleViewAnalyticsClick = () => {
    navigate('/repairer/analytics');
  };

  const handleMessagesClick = () => {
    navigate('/repairer/messages');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header
        displayName={displayName}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
        onNotificationsClick={handleNotificationsClick}
        onProfileClick={handleProfileClick}
        unreadNotificationCount={unreadNotificationCount}
        onMessagesClick={handleMessagesClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isOnline ? (
          <OnlineDashboardContent
            key="online-dashboard"
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
            key="offline-dashboard"
            displayName={displayName}
            stats={stats}
            loadingStats={loadingStats}
            errorStats={errorStats}
            recentActivity={recentActivity}
            loadingActivity={loadingActivity}
            errorActivity={errorActivity}
            onViewAnalyticsClick={handleViewAnalyticsClick}
            onManageProfileClick={handleProfileClick}
          />
        )}
      </div>
    </div>
  );
};

export default RepairerMainDashboard;