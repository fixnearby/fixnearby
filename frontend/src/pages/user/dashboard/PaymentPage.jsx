// frontend/src/pages/user/dashboard/PaymentPage.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';

const PaymentPage = () => {
  const { serviceId } = useParams(); 

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center transform transition-all duration-300 hover:scale-105">
        <div className="flex justify-center mb-6">
          <CreditCard className="w-20 h-20 text-blue-600 animate-bounce" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Initiate Payment
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Service ID: <span className="font-semibold text-blue-700">{serviceId || 'N/A'}</span>
        </p>
        <p className="text-md text-gray-600 mb-8">
          This is where you would integrate our payment gateway to initiate the payment process.
        
        </p>

        <button
          onClick={() => {
            alert('Payment processing simulated! This would integrate with a real payment gateway.');
          
            window.location.href = '/user/dashboard';
          }}
          className="flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors duration-300 shadow-lg hover:shadow-xl w-full mb-4"
        >
          <CheckCircle className="w-6 h-6 mr-2" /> Complete Payment (Simulated)
        </button>

        <Link
          to="/user/dashboard"
          className="flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 mt-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentPage;
