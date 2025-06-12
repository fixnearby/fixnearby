// frontend/src/pages/RepairerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import servicefromjson from '../../../services.json';
// Import User icon from lucide-react, alongside others
import { ArrowLeft, User, Star, MapPin, Wrench, Mail, Phone, Clock, Loader, Camera, Edit, Check, X } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getLucideIcon } from '../../../utils/lucideIconMap.js'; // Keep this for service icons
import { getRepairerProfileDetails, updateRepairerProfile } from '../../../services/apiService';

// Helper function to normalize phone number to digits only
const normalizePhoneNumber = (phoneNumber) => {
  return String(phoneNumber).replace(/\D/g, '').substring(0, 10);
};

// Helper function to normalize pincode to digits only and limit to 6
const normalizePincode = (pincode) => {
  return String(pincode).replace(/\D/g, '').substring(0, 6);
};

const servicesOffered = servicefromjson.home_services.map(item =>
  item.main_category
  );

const RepairerProfilePage = () => {
  const { repairer, setRepairer } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    phone: '',
    pincode: '',
    bio: '',
    experience: 0,
    profileImageUrl: '', // This will hold the URL or empty string for no custom image
    services: [],
  });
  const [saveStatus, setSaveStatus] = useState({ type: null, message: '' });

  // No longer need displayedProfileImageUrl as separate state,
  // we'll conditionally render <img> or <User> icon.

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!repairer || !repairer._id) {
        setLoading(false);
        setError("Repairer not logged in or ID is missing.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedData = await getRepairerProfileDetails();

        const normalizedServices = fetchedData.services?.map(s => ({
          name: s.name || '',
          visitingCharge: s.visitingCharge ?? 0
        })) || [];

        setProfileData({
          fullname: fetchedData.fullname,
          email: fetchedData.email,
          phone: fetchedData.phone,
          aadharcardNumber: fetchedData.aadharcardNumber,
          experience: fetchedData.experience || 0,
          averageRating: fetchedData.rating?.average?.toFixed(1) || "0.0",
          reviewsCount: fetchedData.rating?.count || 0,
          location: fetchedData.pincode ? `Pincode ${fetchedData.pincode}` : "Location not specified",
          pincode: fetchedData.pincode,
          services: normalizedServices,
          bio: fetchedData.bio || "No biography provided yet. Update your profile!",
          // If profileImageUrl is null/empty, set to empty string to trigger icon fallback
          profileImageUrl: fetchedData.profileImageUrl || ''
        });

        // Initialize edit form with current data
        setEditForm({
          fullname: fetchedData.fullname,
          phone: fetchedData.phone,
          pincode: fetchedData.pincode,
          bio: fetchedData.bio || '',
          experience: fetchedData.experience || 0,
          profileImageUrl: fetchedData.profileImageUrl || '', // Initialize edit form with fetched URL (or empty)
          services: normalizedServices,
        });

      } catch (err) {
        console.error("Error fetching profile details:", err);
        setError(err.message || "Failed to load profile details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [repairer, setRepairer]);

  // Handler for image file selection
  const handleProfileImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      // Create a temporary object URL for immediate display
      const tempLocalUrl = URL.createObjectURL(file);
      setEditForm(prev => ({
        ...prev,
        profileImageUrl: tempLocalUrl // Store temp URL in editForm
      }));
      // Note: In a real app, you would upload `file` to Cloudinary
      // and then update `editForm.profileImageUrl` with the actual Cloudinary URL
      // after a successful upload.
    }
  };


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setEditForm(prev => ({ ...prev, [name]: normalizePhoneNumber(value) }));
    } else if (name === 'pincode') {
      setEditForm(prev => ({ ...prev, [name]: normalizePincode(value) }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceChange = (index, field, value) => {
    setEditForm(prev => {
      const newServices = [...prev.services];
      if (!newServices[index]) {
        newServices[index] = { name: '', visitingCharge: 0 };
      }
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, services: newServices };
    });
  };

  const addService = () => {
    setEditForm(prev => ({
      ...prev,
      services: [...prev.services, { name: '', visitingCharge: 0 }]
    }));
  };

  const removeService = (index) => {
    setEditForm(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaveStatus({ type: null, message: '' });
      setLoading(true);

      const filteredServices = editForm.services.filter(service => service.name.trim() !== '');

      const dataToSend = {
        ...editForm,
        phone: normalizePhoneNumber(editForm.phone),
        pincode: normalizePincode(editForm.pincode),
        services: filteredServices,
      };

      const updatedData = await updateRepairerProfile(dataToSend);

      const newProfileData = {
        ...profileData,
        fullname: updatedData.repairer.fullname,
        phone: updatedData.repairer.phone,
        pincode: updatedData.repairer.pincode,
        bio: updatedData.repairer.bio,
        experience: updatedData.repairer.experience,
        // Ensure this is set to empty string if backend sends null/undefined
        profileImageUrl: updatedData.repairer.profileImageUrl || '',
        services: updatedData.repairer.services?.map(s => ({
          name: s.name || '',
          visitingCharge: s.visitingCharge ?? 0
        })) || [],
      };
      setProfileData(newProfileData);
      setRepairer({ ...repairer, ...updatedData.repairer });
      setSaveStatus({ type: 'success', message: 'Profile saved successfully!' });
      setIsEditing(false);

    } catch (err) {
      console.error("Error saving profile:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save profile.';
      setSaveStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };


  if (!repairer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as a repairer to view your profile.</p>
          <Link to="/repairer/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
          <p className="text-gray-700 mb-6">{error || "Profile data could not be loaded."}</p>
          <Link to="/repairer/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Determine the image source or if we should show the icon
  const currentProfileImage = isEditing ? editForm.profileImageUrl : profileData.profileImageUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/repairer/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <User className="w-8 h-8 mr-3 text-blue-600" />
            Repairer Profile
          </h1>
        </div>

        {saveStatus.type && (
          <div className={`p-3 rounded-lg mb-4 ${saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {saveStatus.message}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-md flex items-center justify-center bg-gray-100">
            {currentProfileImage ? (
              <img
                src={currentProfileImage}
                alt={`${profileData.fullname}'s profile`}
                className="w-full h-full object-cover"
                // No onError here, as we manage fallback via state (empty string)
              />
            ) : (
              <User className="w-20 h-20 text-gray-400" /> // Lucide User icon as fallback
            )}

            {isEditing && (
              <button
                type="button"
                onClick={() => document.getElementById('profileImageInput').click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-md"
                title="Change profile image"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <input
              type="file"
              id="profileImageInput"
              className="hidden"
              onChange={handleProfileImageChange}
              accept="image/*"
            />
          </div>
          <div className="text-center md:text-left">
            {isEditing ? (
              <input
                type="text"
                name="fullname"
                value={editForm.fullname}
                onChange={handleEditChange}
                className="text-2xl font-bold text-gray-900 w-full p-1 border rounded"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{profileData.fullname}</h2>
            )}
            <p className="text-gray-600 text-lg mb-2">Professional Repairer</p>
            <div className="flex items-center justify-center md:justify-start mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(parseFloat(profileData.averageRating)) ?
                    'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
              <span className="text-gray-600 ml-2">({profileData.reviewsCount} reviews)</span>
            </div>
            <p className="text-gray-700 flex items-center justify-center md:justify-start">
              <MapPin className="w-4 h-4 mr-2" /> {profileData.location} {profileData.pincode && `(Pincode: ${profileData.pincode})`}
            </p>
          </div>
          <div className="md:ml-auto">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  disabled={loading}
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full font-medium hover:bg-gray-400 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About Me</h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={editForm.bio}
              onChange={handleEditChange}
              className="w-full p-2 border rounded resize-y"
              rows="4"
              maxLength="500"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed mb-6">{profileData.bio}</p>
          )}

          <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-2 text-gray-700">
            <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> <strong>Email:</strong> {profileData.email}</p>
            <p className="flex items-center">
              <Phone className="w-4 h-4 mr-2" /> <strong>Phone:</strong>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  maxLength="10"
                  placeholder="10-digit number"
                  className="p-1 border rounded"
                />
              ) : (
                profileData.phone
              )}
            </p>
            <p className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> <strong>Pincode:</strong>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="pincode"
                  value={editForm.pincode}
                  onChange={handleEditChange}
                  maxLength="6"
                  placeholder="6-digit pincode"
                  className="p-1 border rounded"
                />
              ) : (
                profileData.pincode
              )}
            </p>
            <p className="flex items-center">
              <Clock className="w-4 h-4 mr-2" /> <strong>Experience:</strong>{" "}
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={editForm.experience}
                  onChange={handleEditChange}
                  min="0"
                  className="p-1 border rounded w-20"
                />
              ) : (
                `${profileData.experience} years`
              )}
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Services Offered</h3>
          {isEditing ? (
            <div>
              {editForm.services.map((service, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2 p-1 bg-gray-50 rounded">
                              <select 
                      id="services" 
                      name="services" 
                      value={service.name} 
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                      className={`block w-full pl-5 pr-3 py-1 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors `}
                    >
                      <option value="">Select your service</option> {/* CHANGED: profession -> service */}
                      {servicesOffered.map((service) => ( // CHANGED: professions.map -> servicesOffered.map
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  <input
                    type="number"
                    placeholder="Visiting Charge"
                    value={service.visitingCharge}
                    onChange={(e) => handleServiceChange(index, 'visitingCharge', parseFloat(e.target.value) || 0)}
                    className="w-32 p-1 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addService}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
              >
                Add Service
              </button>
              <p className="text-sm text-gray-500 mt-2">Services with empty names will not be saved.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {profileData.services.length > 0 ? (
                profileData.services.map((service, index) => {
                  const ServiceIcon = getLucideIcon(service.name.replace(/\s/g, ''), Wrench);
                  return (
                    <span key={index} className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium text-sm">
                      <ServiceIcon className="w-4 h-4 mr-2" /> {service.name} {service.visitingCharge > 0 && `($${service.visitingCharge})`}
                    </span>
                  );
                })
              ) : (
                <p className="text-gray-500">No services added yet. Click "Edit Profile" to add your services!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairerProfilePage;