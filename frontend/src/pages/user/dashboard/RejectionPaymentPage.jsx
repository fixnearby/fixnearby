import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, XCircle, IndianRupee, CheckCircle } from 'lucide-react';
import { getPaymentDetailsById, createRazorpayOrder, verifyAndTransferPayment } from '../../../../src/services/apiService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../components/LoadingSpinner';

const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

const RejectionPaymentPage = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();

    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!paymentId) {
                setError("No payment ID provided in the URL.");
                setLoading(false);
                toast.error("No payment ID found for rejection fee.");
                return;
            }
            try {
                setLoading(true);
                const responseData = await getPaymentDetailsById(paymentId);

                if (!responseData.success || !responseData.data) {
                    const msg = responseData.message || 'Failed to load payment details from API.';
                    setError(msg);
                    toast.error(msg);
                    setLoading(false);
                    return;
                }

                setPaymentDetails(responseData.data);

                if (responseData.data.status === 'captured') {
                    setPaymentSuccess(true);
                    setPaymentMessage("Payment successful!");
                    toast.success("Rejection fee already paid.");
                    setLoading(false); 
                    setPaymentProcessing(false); 
                    return; 
                } else if (responseData.data.paymentMethod !== 'rejection_fee') {
                    setError("This payment is not a rejection fee. Invalid access.");
                    toast.error("Invalid payment type for rejection fee.");
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to load payment details. Please try again.';
                setError(errorMessage);
                toast.error(errorMessage);
                console.error("DEBUG: Error fetching payment details:", err);
            } finally {
                setLoading(false);
                console.log("DEBUG: Finished fetching payment details. Loading state set to false.");
            }
        };

        fetchPaymentDetails();
    }, [paymentId]); 

    useEffect(() => {
        if (!loading && !error && paymentDetails && paymentDetails.status !== 'captured' && typeof window.Razorpay === 'undefined') {
            console.log("DEBUG: Conditions met for loading Razorpay SDK. Attempting to load.");
            loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        }
    }, [loading, error, paymentDetails]);

    const handlePayment = async () => {
        if (!paymentDetails || paymentDetails.amount <= 0 || paymentDetails.status === 'captured' || (paymentDetails.status !== 'created' && paymentDetails.status !== 'pending')) {
            setError("Cannot initiate payment: Invalid payment details or already processed.");
            toast.error("Cannot initiate payment: Invalid details or already processed.");
            console.warn("DEBUG: Payment initiation prevented due to invalid details/status.");
            return;
        }

        setPaymentProcessing(true);
        setError(null);
        setPaymentSuccess(false); 
        setPaymentMessage(''); 
        console.log("DEBUG: Initiating payment process.");

        try {
            const orderResponse = await createRazorpayOrder(paymentDetails._id);

            if (!orderResponse.success) {
                setError(orderResponse.message || "Failed to create Razorpay order.");
                toast.error(orderResponse.message || "Failed to create Razorpay order.");
                setPaymentProcessing(false);
                console.error("DEBUG: Failed to create Razorpay order:", orderResponse);
                return;
            }

            const { orderId, currency, amount, razorpayKey, serviceTitle, customerName, customerPhone } = orderResponse.data;
            console.log("DEBUG: Razorpay order created successfully. Order ID:", orderId);

            if (typeof window.Razorpay === 'undefined') {
                toast.error("Razorpay SDK not loaded. Please try again or refresh the page.");
                setPaymentProcessing(false);
                console.error("DEBUG: Razorpay SDK not available for payment popup.");
                return;
            }

            const options = {
                key: razorpayKey,
                amount,
                currency,
                name: "FixNearby Rejection Fee",
                description: serviceTitle || "Rejection Fee for Service",
                order_id: orderId,
                
                handler: async (response) => {
                    console.log("DEBUG: Razorpay handler called (payment success callback). Response:", response);
                    setPaymentProcessing(true); 
                    try {
                        const payload = {
                            paymentId: paymentDetails._id,
                            serviceRequestId: paymentDetails.serviceRequest,
                            transactionDetails: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }
                        };
                        
                        console.log("DEBUG: Sending verification payload to backend.");
                        const verificationResponse = await verifyAndTransferPayment(payload);

                        console.log("DEBUG: Backend verification response:", verificationResponse);
                        if (!verificationResponse.success) {
                            throw new Error(verificationResponse.message || "Verification failed on server.");
                        }

                        console.log("DEBUG: Payment verified successfully. Setting paymentSuccess to true.");
                        setPaymentSuccess(true);
                        setPaymentMessage("Payment successful!"); 
                        toast.success("Rejection fee paid successfully!");
                      
                    } catch (verifyErr) {
                        const verifyErrorMessage = verifyErr.message || "Payment verification failed. Please contact support.";
                        setError(verifyErrorMessage);
                        toast.error(verifyErrorMessage);
                        console.error("DEBUG: Error during backend verification:", verifyErr);
                    } finally {
                        setPaymentProcessing(false); 
                        console.log("DEBUG: Verification handler finished. Payment processing set to false.");
                    }
                },
                prefill: {
                    name: customerName || "",
                    email: '',
                    contact: customerPhone || ""
                },
                notes: {
                    payment_record_id: paymentDetails._id,
                    service_request_id: paymentDetails.serviceRequest
                },
                theme: {
                    color: "#EF4444"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                console.log("DEBUG: Razorpay payment failed callback. Response:", response);
                setPaymentProcessing(false);
                setPaymentSuccess(false);
                const failErrorMessage = response.error.description || 'Unknown error';
                setError(`Payment failed: ${failErrorMessage}. Error Code: ${response.error.code}`);
                toast.error(`Payment Failed: ${failErrorMessage}`);
            });
            rzp.open();
            console.log("DEBUG: Razorpay popup opened.");

        } catch (err) {
            const initErrorMessage = err.response?.data?.message || err.message || 'Unknown error.';
            setError(`Failed to initiate payment: ${initErrorMessage}`);
            setPaymentSuccess(false); 
            toast.error(`Failed to initiate payment: ${initErrorMessage}`);
            console.error("DEBUG: Error initiating payment (before Razorpay handler could open):", err);
        } finally {
            
            if (error) { 
                setPaymentProcessing(false);
            }
            console.log("DEBUG: handlePayment outer try-catch finished.");
        }
    };

    const handleGoToDashboard = () => {
        console.log("DEBUG: 'Go to Dashboard' button clicked. Navigating...");
        navigate('/user/dashboard');
    };

    const isPayButtonDisabled = paymentProcessing || !paymentDetails || paymentDetails.amount <= 0 || paymentDetails.status === 'captured';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 text-gray-800 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-6">
                    <XCircle className="w-20 h-20 text-red-600 animate-bounce" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    Rejection Fee Payment
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center text-red-600 text-lg mb-6">
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading Payment Details...
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-lg mb-6 flex items-center justify-center">
                        <XCircle className="w-6 h-6 mr-2" /> {error}
                    </div>
                ) : paymentSuccess ? ( 
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-scale-in" />
                        <p className="text-2xl font-bold text-gray-800 mb-4">{paymentMessage}</p>
                        <button
                            onClick={handleGoToDashboard}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-xl font-semibold transition-colors duration-300 hover:bg-blue-700 shadow-lg"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : paymentDetails ? ( 
                    <>
                        <p className="text-lg text-gray-700 mb-2">
                            {paymentDetails.description || 'Fee for rejected quotation.'}
                        </p>
                        <p className="text-lg text-gray-700 mb-4">
                            Amount: <span className="font-semibold text-red-700">₹{(paymentDetails.amount / 100)?.toFixed(2) || '0.00'}</span>
                        </p>
                        <p className="text-md text-gray-600 mb-8">
                            This fee is charged for rejecting a quoted service.
                        </p>

                        <button
                            onClick={handlePayment}
                            disabled={isPayButtonDisabled}
                            className={`flex items-center justify-center px-8 py-3 rounded-lg text-xl font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl w-full mb-4
                                ${isPayButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                        >
                            {paymentProcessing ? (
                                <>
                                    <LoadingSpinner className="w-6 h-6 mr-2 animate-spin" /> Processing...
                                </>
                            ) : (
                                <>
                                    <IndianRupee className="w-6 h-6 mr-2" />
                                    Pay ₹{(paymentDetails.amount / 100)?.toFixed(2) || '0.00'}
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <p className="text-md text-gray-600 mb-8">No payment details found to initiate payment.</p>
                )}

                {paymentProcessing && !error && !paymentSuccess && ( // Only show processing message if not already successful
                    <p className="text-sm text-gray-600 mt-4">Please wait, processing payment...</p>
                )}
            </div>
        </div>
    );
};

export default RejectionPaymentPage;