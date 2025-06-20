// frontend/src/pages/user/notifications/UserNotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, Loader, Info } from 'lucide-react';
import toast from 'react-hot-toast';

import { getUserNotifications } from '../../../services/apiService.js';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx';

const UserNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUserNotifications();
        if (response.success) {
          setNotifications(response.notifications);
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      } catch (err) {
        console.error("Error fetching user notifications:", err);
        setError("Failed to load notifications. Please try again.");
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8 font-lexend">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] flex items-center mb-4 sm:mb-0">
            <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 mr-3" /> Notifications
          </h1>
          <Link
            to="/user/dashboard"
            className="flex items-center px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-700 hover:text-emerald-700 transition-all duration-200 font-medium text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-10">
            <LoadingSpinner className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-emerald-500" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center text-sm sm:text-base">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <p className="text-xs sm:text-sm mt-2">Please ensure you are logged in and your internet connection is stable.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-base sm:text-lg mb-2">No new notifications.</p>
            <p className="text-sm sm:text-base">Check back later for updates on your services and new offers!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map(notification => (
              <li key={notification._id || notification.id} className="py-4 flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Info className="w-5 h-5 text-green-500" />
                </div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <p className="text-[#2C2C2C] text-sm sm:text-base font-medium leading-relaxed">{notification.message}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserNotificationsPage;