import React from 'react';
import { Star, MapPin, Clock, Wrench } from 'lucide-react';
import { serviceIcons } from '../../utils/serviceIcons'; // We'll create this utility file

const RepairerCard = ({ repairer, serviceCategory, openServiceRequestForm }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-gray-400">
            {serviceIcons[serviceCategory.toLowerCase()] || <Wrench size={32} />}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900">{repairer.fullname}</h2>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(repairer.rating?.average || 0) ?
                    'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                ({repairer.rating?.count || 0} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{repairer.location?.address || 'Location not specified'} (Pincode: {repairer.location?.postalCode})</span>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {repairer.services && repairer.services.map((service, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-50 px-3 py-1 rounded-full"
              >
                {serviceIcons[service.name.toLowerCase()] || <Wrench className="w-5 h-5" />}
                <span className="ml-2 text-sm font-medium">
                  {service.name} (₹{service.price})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{repairer.experience || 0} years experience</span>
          </div>

          <button
            onClick={() => openServiceRequestForm(repairer._id)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Request Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairerCard;