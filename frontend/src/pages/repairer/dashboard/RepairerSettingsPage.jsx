// frontend/src/pages/repairer/dashboard/RepairerSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Loader } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { updateRepairerSettings, getRepairerProfileDetails } from '../../../services/apiService'; // Import getRepairerProfileDetails

const RepairerSettingsPage = () => {
  const { repairer, setRepairer } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    serviceRadius: 25,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      if (repairer) {
        try {
          // Fetch the full repairer profile to get the latest preferences
          const fullProfile = await getRepairerProfileDetails();
          setSettingsData({
            emailNotifications: fullProfile.preferences?.emailNotifications ?? true,
            smsNotifications: fullProfile.preferences?.smsNotifications ?? false,
            serviceRadius: fullProfile.preferences?.serviceRadius ?? 25,
          });
        } catch (err) {
          console.error("Error loading repairer settings:", err);
          setSaveError("Failed to load current settings.");
        }
      }
      setLoading(false);
    };

    loadSettings();
  }, [repairer]);

  const handleSettingChange = (e) => {
    const { name, type, value, checked } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaveSuccess(null);
    setSaveError(null);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    if (!repairer || !repairer._id) {
      setSaveError("Repairer not authenticated.");
      setIsSaving(false);
      return;
    }

    try {
      const updatedResponse = await updateRepairerSettings(settingsData);
      setSaveSuccess(updatedResponse.message || "Settings saved successfully!");

      // Update the authStore with the new preferences
      setRepairer(prevRepairer => ({
        ...prevRepairer,
        preferences: updatedResponse.preferences // Use the updated preferences from the response
      }));
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveError(error.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!repairer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as a repairer to view your settings.</p>
          <Link to="/repairer/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/repairer/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Repairer Settings
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveChanges} className="space-y-6">
            {saveSuccess && (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                {saveSuccess}
              </div>
            )}
            {saveError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                {saveError}
              </div>
            )}

            {/* Notification Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Notification Preferences</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <label htmlFor="emailNotifications" className="text-gray-700 cursor-pointer">
                  Email Notifications
                </label>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={settingsData.emailNotifications}
                  onChange={handleSettingChange}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-2">
                <label htmlFor="smsNotifications" className="text-gray-700 cursor-pointer">
                  SMS Notifications
                </label>
                <input
                  type="checkbox"
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={settingsData.smsNotifications}
                  onChange={handleSettingChange}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Service Area Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Service Area</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label htmlFor="serviceRadius" className="block text-gray-700 text-sm font-medium mb-2">
                  Service Radius (in kilometers)
                </label>
                <input
                  type="number"
                  id="serviceRadius"
                  name="serviceRadius"
                  value={settingsData.serviceRadius}
                  onChange={handleSettingChange}
                  min="5"
                  max="200"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Adjust the maximum distance you are willing to travel for jobs.</p>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RepairerSettingsPage;