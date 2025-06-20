import React from 'react';
import { LogOut, Bell, User, Settings, ClipboardList, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ displayName, isOnline, setIsOnline, onSettingsClick, onLogout, onNotificationsClick, onProfileClick, unreadNotificationCount, onMessagesClick }) => {
  const navigate = useNavigate();

  const handleAssignedJobsClick = () => {
    navigate('/repairer/inprogress');
  };

  return (
    <header className="bg-white shadow-md p-3 sm:p-4 flex items-center justify-between rounded-b-3xl font-lexend">
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6 min-w-0 flex-grow">
        <h1 className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold text-[#2C2C2C] flex-shrink truncate">
          Welcome, {displayName}!
        </h1>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          <span className="text-xs sm:text-sm text-gray-600">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
          <span className="text-[#2C2C2C] font-medium text-xs sm:text-sm hidden sm:block">
            Go {isOnline ? 'Offline' : 'Online'}:
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isOnline}
              onChange={() => setIsOnline(!isOnline)}
            />
            <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 ml-auto flex-shrink-0">
        <button
          onClick={onMessagesClick}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          aria-label="Messages"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C2C2C]" />
        </button>

        <button
          onClick={handleAssignedJobsClick}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          aria-label="Assigned Jobs"
        >
          <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C2C2C]" />
        </button>

        <button
          onClick={onNotificationsClick}
          className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C2C2C]" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </button>

        <button
          onClick={onProfileClick}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          aria-label="Profile"
        >
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C2C2C]" />
        </button>

        <button
          onClick={onSettingsClick}
          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors hidden md:block"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C2C2C]" />
        </button>

        <button
          onClick={onLogout}
          className="p-1.5 sm:p-2 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors sm:block"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;