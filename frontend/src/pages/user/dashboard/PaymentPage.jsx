// frontend/src/pages/user/dashboard/PaymentPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Loader2, XCircle } from 'lucide-react';
import { getServiceRequestById, createRazorpayOrder, verifyAndTransferPayment } from '../../../services/apiService';

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
    const { serviceId } = useParams();
    const navigate = useNavigate();

    const [serviceDetails, setServiceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                setLoading(true);
                const responseData = await getServiceRequestById(serviceId);
                setServiceDetails(responseData);

                const allowedStatuses = ['quoted', 'accepted', 'in_progress', 'completed'];

                if (!allowedStatuses.includes(responseData.status)) {
                    setError(`This service is in '${responseData.status}' status and cannot be paid. Payment is only allowed for jobs that are quoted, accepted, in progress, or completed by the customer.`);
                }
            } catch (err) {
                console.error("Error fetching service details:", err);
                setError(err.response?.data?.message || 'Failed to load service details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchServiceDetails();
        }
    }, [serviceId, navigate]);

    useEffect(() => {
        if (!loading && !error && serviceDetails) {
            loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        }
    }, [loading, error, serviceDetails]);

    const handlePayment = async () => {
        if (!serviceDetails || serviceDetails.estimatedPrice <= 0) {
            setError("Cannot initiate payment: Service details not loaded or has no valid price.");
            return;
        }

        const allowedPaymentInitiationStatuses = ['quoted', 'accepted', 'in_progress', 'completed'];
        if (!allowedPaymentInitiationStatuses.includes(serviceDetails.status)) {
            setError(`Payment cannot be initiated for a job in '${serviceDetails.status}' status. It must be quoted, accepted, in progress, or completed by you.`);
            return;
        }

        setPaymentProcessing(true);
        setPaymentSuccess(false);
        setPaymentMessage('');
        setError(null);

        try {
            const orderResponse = await createRazorpayOrder(serviceId);

            const { orderId, currency, amount, key_id, serviceTitle, customerName, customerPhone, paymentRecordId } = orderResponse;

            if (!window.Razorpay) {
                alert("Razorpay SDK not loaded. Please try again or refresh the page.");
                setPaymentProcessing(false);
                return;
            }

            const options = {
                key: key_id,
                amount: amount,
                currency: currency,
                name: "FixNearby Services",
                description: `Payment for: ${serviceTitle}`,
                order_id: orderId,
                handler: async (response) => {
                    setPaymentProcessing(true);
                    try {
                        const verificationResponse = await verifyAndTransferPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentRecordId: paymentRecordId
                        });
                        console.log(verificationResponse);

                        setPaymentSuccess(true);
                        setPaymentMessage("Payment successful! Service status updated and payout initiated.");
                        alert("Payment successful! The service has been marked as accepted and payout initiated.");
                        navigate('/user/in-progress');
                    } catch (verifyErr) {
                        console.error("Payment verification failed:", verifyErr);
                        setError("Payment was successful but verification failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
                        setPaymentSuccess(false);
                        setPaymentMessage("Payment failed to verify. Please contact support.");
                    } finally {
                        setPaymentProcessing(false);
                    }
                },
                prefill: {
                    name: customerName,
                    email: serviceDetails.contactInfo?.email || '',
                    contact: customerPhone
                },
                notes: {
                    service_id: serviceId,
                    payment_record_id: paymentRecordId
                },
                theme: {
                    color: "#3B82F6"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setPaymentProcessing(false);
                setPaymentSuccess(false);
                setError(`Payment failed: ${response.error.description || 'Unknown error'}. Error Code: ${response.error.code}`);
                setPaymentMessage('Payment failed. Please try again.');
                alert(`Payment Failed: ${response.error.description}`);
                console.error("Razorpay Payment Failed:", response.error);
            });
            rzp.open();

        } catch (err) {
            console.error("Error initiating Razorpay order:", err);
            setError(`Failed to initiate payment: ${err.response?.data?.message || err.message}`);
            setPaymentSuccess(false);
            setPaymentMessage('Failed to initiate payment.');
        } finally {
            if (!error && !paymentSuccess) {
                setPaymentProcessing(false);
            }
        }
    };

    const isPayButtonDisabled = paymentProcessing || serviceDetails?.estimatedPrice <= 0 || !['quoted', 'accepted', 'in_progress', 'completed'].includes(serviceDetails?.status);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-6">
                    <CreditCard className="w-20 h-20 text-blue-600 animate-bounce" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    Initiate Payment
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center text-blue-600 text-lg mb-6">
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading Service Details...
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-lg mb-6 flex items-center justify-center">
                        <XCircle className="w-6 h-6 mr-2" /> {error}
                    </div>
                ) : serviceDetails ? (
                    <>
                        <p className="text-lg text-gray-700 mb-2">
                            Service Title: <span className="font-semibold text-blue-700">{serviceDetails.title || 'N/A'}</span>
                        </p>
                        <p className="text-lg text-gray-700 mb-4">
                            Amount: <span className="font-semibold text-green-700">₹{serviceDetails.estimatedPrice?.toFixed(2) || '0.00'}</span>
                        </p>
                        <p className="text-md text-gray-600 mb-8">
                            This payment will secure your service request and facilitate the payout to the repairer.
                        </p>

                        {paymentSuccess ? (
                            <div className="flex items-center justify-center bg-green-100 text-green-700 px-6 py-3 rounded-lg text-lg font-semibold mb-4 animate-fade-in">
                                <CheckCircle className="w-6 h-6 mr-2" /> {paymentMessage || "Payment process completed."}
                            </div>
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
                                        <CreditCard className="w-6 h-6 mr-2" /> Pay Now ₹{serviceDetails.estimatedPrice?.toFixed(2) || '0.00'}
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-md text-gray-600 mb-8">No service details found to initiate payment.</p>
                )}

                <Link
                    to="/user/in-progress"
                    className="flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 mt-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to In-Progress Services
                </Link>
            </div>
        </div>
    );
};

export default PaymentPage;
