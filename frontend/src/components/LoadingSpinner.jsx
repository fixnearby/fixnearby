import React from 'react';
import './LoadingSpinner.css'; 

const LoadingSpinner = ({ message = "Loading...", showMessage = true }) => {
  return (
    <div className="loader-container">
      <div className="spinner"></div> 
      {showMessage && <p className="loading-message text-[#2C2C2C] font-lexend">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
