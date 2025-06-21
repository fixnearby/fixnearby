import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Loader2, XCircle, Star } from 'lucide-react'; 
import { getPaymentDetailsById, getServiceRequestById, createRazorpayOrder, verifyAndTransferPayment } from '../../../services/apiService';

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

const PaymentPage = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();

    const [paymentDetails, setPaymentDetails] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');
    const [showReviewOption, setShowReviewOption] = useState(false);
    const [canShowPayButton, setCanShowPayButton] = useState(false);

    useEffect(() => {
        const fetchAllDetails = async () => {
            try {
                setLoading(true);
                setError(null); 
                setShowReviewOption(false); 
                setCanShowPayButton(false);

                if (!paymentId) {
                    setError("Invalid payment link. Payment ID is missing.");
                    setLoading(false);
                    return;
                }
                const paymentResponse = await getPaymentDetailsById(paymentId);

                if (!paymentResponse || !paymentResponse.success) {
                    const msg = paymentResponse?.message || "Failed to load payment details from API.";
                    setError(msg);
                    setLoading(false);
                    return;
                }

                const fetchedPaymentDetails = paymentResponse.data;
                setPaymentDetails(fetchedPaymentDetails);

                if (['paid_by_customer', 'completed', 'closed_rejected'].includes(fetchedPaymentDetails.status)) {
                    setPaymentSuccess(true);
                    setPaymentMessage("Payment has already been processed successfully.");
                } else if (['created', 'pending'].includes(fetchedPaymentDetails.status)) {
                    setCanShowPayButton(true);
                } else {
                    setError(`This payment record is in '${fetchedPaymentDetails.status}' status and cannot be processed.`);
                    setLoading(false);
                    return;
                }
                
                let currentServiceRequestId = null;
                if (fetchedPaymentDetails.serviceRequest) {
                    currentServiceRequestId = typeof fetchedPaymentDetails.serviceRequest === 'object' && fetchedPaymentDetails.serviceRequest._id
                        ? fetchedPaymentDetails.serviceRequest._id
                        : fetchedPaymentDetails.serviceRequest; 

                    const serviceResponse = await getServiceRequestById(currentServiceRequestId);
                    if (!serviceResponse || serviceResponse.message) {
                        const msg = serviceResponse?.message || "Could not fetch associated service details.";
                        setError(msg);
                        setLoading(false);
                        return;
                    }

                    const fetchedServiceDetails = serviceResponse; 
                    setServiceDetails(fetchedServiceDetails);

                    if (['customer_paid', 'completed', 'closed_rejected'].includes(fetchedServiceDetails.status) &&
                        (!fetchedServiceDetails.rating || !fetchedServiceDetails.rating.stars)) {
                        setShowReviewOption(true);
                        setPaymentSuccess(true);
                        setPaymentMessage("Payment processed. Please leave a review!");
                        setCanShowPayButton(false);
                    } else if (['customer_paid', 'completed', 'closed_rejected'].includes(fetchedServiceDetails.status) &&
                                 fetchedServiceDetails.rating && fetchedServiceDetails.rating.stars) {
                        setPaymentSuccess(true);
                        setPaymentMessage("Payment processed and service reviewed.");
                        setCanShowPayButton(false);
                    } else if (['pending_payment', 'quoted', 'accepted', 'in_progress'].includes(fetchedServiceDetails.status)) {
                        setCanShowPayButton(true);
                    } else {
                        setError(`Service status '${fetchedServiceDetails.status}' is not valid for this payment page.`);
                        setCanShowPayButton(false);
                    }


                } else {
                    setError("Could not find associated service details for this payment.");
                    setCanShowPayButton(false);
                }

            } catch (err) {
                const errorMessage = err.message || 'Failed to load payment or service details. Please try again.';
                setError(errorMessage);
                setCanShowPayButton(false);
            } finally {
                setLoading(false);
            }
        };

        if (paymentId) {
            fetchAllDetails();
        }
    }, [paymentId, navigate]);
    
    useEffect(() => {
        if (!loading && !error && paymentDetails && serviceDetails && window.Razorpay === undefined) {
            loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        }
    }, [loading, error, paymentDetails, serviceDetails]);


    const handlePayment = async () => {
        if (paymentSuccess || !canShowPayButton) {
            setError("Payment cannot be initiated. Service is already processed or not in a payable state.");
            return;
        }

        if (!paymentDetails || !serviceDetails || paymentDetails.amount <= 0) {
            setError("Cannot initiate payment: Details not fully loaded or invalid amount.");
            return;
        }
        
        const allowedPaymentRecordStatusesForInitiation = ['created', 'pending'];
        if (!allowedPaymentRecordStatusesForInitiation.includes(paymentDetails.status)) {
             setError(`Payment cannot be initiated as its record is in '${paymentDetails.status}' status.`);
             return;
        }
        const allowedServiceStatusesForInitiation = ['quoted', 'accepted', 'in_progress', 'pending_payment'];
        if (!allowedServiceStatusesForInitiation.includes(serviceDetails.status)) {
             setError(`Payment cannot be initiated for a service in '${serviceDetails.status}' status.`);
             return;
        }

        setPaymentProcessing(true);
        setPaymentSuccess(false);
        setPaymentMessage('');
        setError(null);
        setShowReviewOption(false); 

        try {
            const orderResponse = await createRazorpayOrder(paymentDetails._id);
            
            if (!orderResponse || !orderResponse.success) {
                setError(orderResponse?.message || "Failed to create Razorpay order or unexpected response structure.");
                setPaymentProcessing(false);
                return;
            }

            if (!orderResponse.data || typeof orderResponse.data !== 'object') {
                setError("Failed to create Razorpay order: Essential response data is missing or malformed. Please contact support.");
                setPaymentProcessing(false);
                return;
            }

            const { orderId, currency, amount, razorpayKey, serviceTitle, customerName, customerPhone } = orderResponse.data;
            const currentPaymentRecordId = paymentDetails._id;

            if (!window.Razorpay) {
                alert("Razorpay SDK not loaded. Please try again or refresh the page.");
                setPaymentProcessing(false);
                return;
            }

            const options = {
                key: razorpayKey,
                amount: amount,
                currency: currency,
                name: "FixNearby Services",
                description: `Payment for: ${serviceTitle || serviceDetails.title}`,
                order_id: orderId,
                handler: async (response) => {
                    setPaymentProcessing(true);
                    try {
                        const verificationResponse = await verifyAndTransferPayment({
                            paymentId: currentPaymentRecordId,
                            serviceRequestId: serviceDetails._id,
                            transactionDetails: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }
                        });

                        if (!verificationResponse || !verificationResponse.success) {
                            throw new Error(verificationResponse?.message || "Verification failed on server or unexpected response structure.");
                        }

                        setPaymentSuccess(true);
                        setPaymentMessage("Payment successful! Your service has been marked as paid.");
                        alert("Payment successful! Your service has been marked as paid.");

                        if (!['rejected', 'closed_rejected'].includes(serviceDetails.status)) {
                            setTimeout(() => {
                                navigate(`/review/${serviceDetails._id}`); 
                            }, 1500); 
                        } else {
                            setTimeout(() => {
                                navigate(`/user/completed-services`);
                            }, 1500);
                        }
                        setCanShowPayButton(false);

                    } catch (verifyErr) {
                        const verifyErrorMessage = verifyErr.message || "Unknown error during verification.";
                        setError("Payment was successful but verification failed: " + verifyErrorMessage);
                        setPaymentSuccess(false);
                        setPaymentMessage("Payment failed to verify. Please contact support.");
                        alert("Payment failed to verify. Please contact support.");
                    } finally {
                        setPaymentProcessing(false);
                    }
                },
                prefill: {
                    name: customerName || serviceDetails.customer?.fullname || '',
                    email: serviceDetails.customer?.email || '',
                    contact: customerPhone || serviceDetails.customer?.phone || ''
                },
                notes: {
                    service_id: serviceDetails._id,
                    payment_record_id: paymentDetails._id
                },
                theme: {
                    color: "#3B82F6"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setPaymentProcessing(false);
                setPaymentSuccess(false);
                setShowReviewOption(false);
                const failErrorMessage = response.error.description || 'Unknown error';
                setError(`Payment failed: ${failErrorMessage}. Error Code: ${response.error.code}`);
                setPaymentMessage('Payment failed. Please try again.');
                alert(`Payment Failed: ${failErrorMessage}`);
            });
            rzp.open();

        } catch (err) {
            const initErrorMessage = err.message || 'Unknown error.';
            setError(`Failed to initiate payment: ${initErrorMessage}`);
            setPaymentSuccess(false);
            setPaymentMessage('Failed to initiate payment.');
        } finally {
            if (!error && !paymentSuccess) {
                setPaymentProcessing(false);
            }
        }
    };

    const isPayButtonDisabled = paymentProcessing || !canShowPayButton;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-6">
                    <CreditCard className="w-20 h-20 text-blue-600 animate-bounce" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    Complete Payment
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center text-blue-600 text-lg mb-6">
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading Details...
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-lg mb-6 flex items-center justify-center">
                        <XCircle className="w-6 h-6 mr-2" /> {error}
                    </div>
                ) : (
                    <>
                        {paymentDetails && serviceDetails ? (
                            <>
                                <p className="text-lg text-gray-700 mb-2">
                                    Service: <span className="font-semibold text-blue-700">{serviceDetails.title || 'N/A'}</span>
                                </p>
                                <p className="text-lg text-gray-700 mb-4">
                                    Amount: <span className="font-semibold text-green-700">₹{(paymentDetails.amount)?.toFixed(2) || '0.00'}</span>
                                </p>
                                <p className="text-md text-gray-600 mb-8">
                                    This payment will mark your service request as paid from your side.
                                </p>

                                {paymentSuccess ? (
                                    <>
                                        <div className="flex items-center justify-center bg-green-100 text-green-700 px-6 py-3 rounded-lg text-lg font-semibold mb-4 animate-fade-in">
                                            <CheckCircle className="w-6 h-6 mr-2" /> {paymentMessage || "Payment process completed."}
                                        </div>
                                        {showReviewOption && (
                                            <Link
                                                to={`/review/${serviceDetails._id}`} 
                                                className="flex items-center justify-center px-8 py-3 rounded-lg text-xl font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl w-full mb-4 bg-yellow-500 text-white hover:bg-yellow-600"
                                            >
                                                <Star className="w-6 h-6 mr-2" /> Leave a Review
                                            </Link>
                                        )}
                                        {!showReviewOption && (
                                            <Link
                                                to="/user/dashboard"
                                                className="flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 mt-4"
                                            >
                                                <ArrowLeft className="w-5 h-5 mr-2" /> Go to Dashboard
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={handlePayment}
                                        disabled={isPayButtonDisabled}
                                        className={`flex items-center justify-center px-8 py-3 rounded-lg text-xl font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl w-full mb-4
                                            ${isPayButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                        {paymentProcessing ? (
                                            <>
                                                <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-6 h-6 mr-2" /> Pay Now ₹{(paymentDetails.amount)?.toFixed(2) || '0.00'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="text-md text-gray-600 mb-8">No payment or service details found to initiate payment.</p>
                        )}
                    </>
                )}

                {!paymentSuccess && (
                    <Link
                        to="/user/inprogress"
                        className="flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 mt-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to In-Progress Services
                    </Link>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;