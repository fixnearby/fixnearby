import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ message, subMessage }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-lg font-medium text-gray-700">
        {message}
      </p>
      {subMessage && (
        <p className="text-sm text-gray-500 mt-2">
          {subMessage}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;