import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../../store/authStore.js";
import { axiosInstance } from "../../../lib/axios.js";
import {
  getInProgressServices,
  customerRejectQuote,
} from "../../../services/apiService.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/LoadingSpinner.jsx";
import { useNavigate, Link } from "react-router-dom";
import {
  Wrench,
  MessageSquare,
  Phone,
  Check,
  Clock,
  MapPin,
  AlertCircle,
  User,
  XCircle,
  CheckCircle,
  IndianRupee,
  ArrowLeft,
} from "lucide-react";

const Inprogress = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [showConfirmAcceptModal, setShowConfirmAcceptModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
  const [showConfirmCompletionModal, setShowConfirmCompletionModal] =
    useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchInProgressRequests = useCallback(async () => {
    if (!user || !user._id) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const responseData = await getInProgressServices();
      setRequests(responseData);
    } catch (err) {
      console.error(
        "Error fetching in-progress requests:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to load your in-progress service requests."
      );
      toast.error("Failed to load your in-progress service requests.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInProgressRequests();
  }, [fetchInProgressRequests]);

  const showAcceptModal = (requestId) => {
    setCurrentRequestId(requestId);
    setShowConfirmAcceptModal(true);
  };

  const showRejectModal = (requestId) => {
    setCurrentRequestId(requestId);
    setShowConfirmRejectModal(true);
  };

  const showCompletionModal = (requestId) => {
    setCurrentRequestId(requestId);
    setShowConfirmCompletionModal(true);
    setOtpInput("");
    setOtpError(null);
  };

  const handleCancelModal = () => {
    setShowConfirmAcceptModal(false);
    setShowConfirmRejectModal(false);
    setShowConfirmCompletionModal(false);
    setCurrentRequestId(null);
    setOtpInput("");
    setOtpError(null);
  };

  const handleAcceptQuoteConfirmed = async () => {
    setShowConfirmAcceptModal(false);
    if (!currentRequestId) return;

    setActionMessage(null);
    try {
      const response = await axiosInstance.put(
        `/service-requests/user/${currentRequestId}/accept-quote`
      );

      if (response.status === 200 || response.data.success) {
        toast.success("Quotation accepted! Repairer will be notified.");
        fetchInProgressRequests();
      } else {
        setActionMessage({
          type: "error",
          text: response.data?.message || "Failed to accept quotation.",
        });
        toast.error("Failed to accept quotation.");
      }
    } catch (err) {
      console.error(
        "Error accepting quote:",
        err.response?.data || err.message
      );
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "An error occurred while accepting the quotation.",
      });
      toast.error(
        err.response?.data?.message ||
          "An error occurred while accepting the quotation."
      );
    } finally {
      setCurrentRequestId(null);
    }
  };

  const handleRejectQuoteConfirmed = async () => {
    setShowConfirmRejectModal(false);
    if (!currentRequestId) return;

    setActionMessage(null);
    try {
      const response = await customerRejectQuote(currentRequestId);

      if (response.success && response.paymentId) {
        toast.success(
          "Quotation rejected. Redirecting to pay rejection fee..."
        );
        navigate(`/rejection-fee/${response.paymentId}`);
      } else {
        setActionMessage({
          type: "error",
          text: response?.message || "Failed to reject quotation.",
        });
        toast.error("Failed to reject quotation.");
      }
    } catch (err) {
      console.error(
        "Error rejecting quote:",
        err.response?.data || err.message
      );
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "An error occurred while rejecting the quotation.",
      });
      toast.error(
        err.response?.data?.message ||
          "An error occurred while rejecting the quotation."
      );
    } finally {
      setCurrentRequestId(null);
    }
  };

  const handleConfirmCompletionConfirmed = async () => {
    setOtpError(null);

    if (!otpInput || otpInput.length !== 6 || !/^\d{6}$/.test(otpInput)) {
      setOtpError("Invalid OTP. Please enter a valid 6-digit code.");
      return;
    }

    try {
      const otpResponse = await axiosInstance.post("/user/verify-serviceotp/", {
        requestId: currentRequestId,
        otp: otpInput,
      });

      if (otpResponse.status === 200 || otpResponse.status === 201) {
        toast.success("OTP verified successfully!");
        setActionMessage(null);
        const statusUpdateResponse = await axiosInstance.put(
          `/service-requests/user/${currentRequestId}/status`,
          {
            status: "pending_payment",
          }
        );

        if (
          statusUpdateResponse.status === 200 ||
          statusUpdateResponse.data.success
        ) {
          const newPaymentId = statusUpdateResponse.data.paymentId;

          if (newPaymentId) {
            toast.success("Service confirmed as completed!");
            toast.success("Redirecting to payment page...");
            navigate(`/user/payment/${newPaymentId}`);
          } else {
            toast.error(
              "Service updated, but no payment ID received. Please check pending payments."
            );
            navigate("/user/dashboard");
          }

          fetchInProgressRequests();
          setShowConfirmCompletionModal(false);
          setCurrentRequestId(null);
          setOtpInput("");
        } else {
          setActionMessage({
            type: "error",
            text:
              statusUpdateResponse.data?.message ||
              "Failed to confirm service completion.",
          });
          toast.error("Failed to confirm service completion.");
        }
      } else {
        setOtpError(
          otpResponse.data?.message ||
            "OTP verification failed. Please try again."
        );
        toast.error(otpResponse.data?.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error(
        "Error in completion process:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.message || "An error occurred during verification.";
      setOtpError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleChatClick = (serviceId) => {
    navigate(`/user/chat/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <LoadingSpinner message="Loading your in-progress services..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="text-center py-8 px-6 bg-red-50 text-red-700 rounded-xl shadow-lg border border-red-200">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Error</h3>
          <p className="text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6 lg:p-8 font-lexend relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-x-4 mb-8">
          <Link
            to="/user/dashboard"
            className={`
              flex items-center p-2 rounded-full bg-white bg-opacity-90 shadow-md text-emerald-600
              hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500
              transition-colors flex-shrink-0
              sm:px-4 sm:py-2 sm:rounded-lg sm:border sm:border-emerald-600 sm:bg-transparent sm:shadow-none
              sm:hover:bg-emerald-50 sm:hover:border-emerald-700 sm:hover:text-emerald-700
              font-medium text-sm sm:text-base
            `}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6 sm:w-5 sm:h-5" />
            <span className="hidden sm:block ml-2">Back to Dashboard</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] flex-grow">
            Your Services in Progress
          </h1>
        </div>

        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm sm:text-base ${
              actionMessage.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="ml-auto text-current hover:opacity-75 transition-opacity"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {requests.length === 0 && !loading && !error ? (
          <div className="text-center py-12 px-4 bg-white rounded-xl shadow-lg border border-gray-100">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-2">
              No active services
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              You don't have any services currently in progress. Create a new
              service request to get started!
            </p>
            <Link
              to="/user/create-request"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Create New Service Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform hover:scale-102 transition-all duration-300"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#2C2C2C] mb-1">
                        {request.title}
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {request.description}
                      </p>
                    </div>
                    <span
                      className={`mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium
                                        ${
                                          request.status === "accepted"
                                            ? "bg-green-100 text-green-800"
                                            : request.status === "quoted"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : request.status === "in_progress" || request.status === "pending_otp"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : request.status === "rejected"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                    >
                      {request.status === "accepted"
                        ? "Accepted"
                        : request.status === "quoted"
                        ? "Quoted"
                        : request.status === "in_progress"
                        ? "In Progress"
                        : request.status === "pending_quote"
                        ? "Pending Quote"
                        : request.status === "requested"
                        ? "Requested"
                        : request.status === "rejected"
                        ? "Rejected"
                        : request.status === "pending_otp"
                        ? "Pending OTP"
                        : request.status}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4 text-sm text-[#2C2C2C]">
                    <div className="flex items-center mb-3">
                      <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2" />
                      <span className="font-medium">Service Type:</span>
                      <span className="ml-2 capitalize">
                        {request.serviceType}
                      </span>
                    </div>

                    <div className="flex items-center mb-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2" />
                      <span className="font-medium">Requested:</span>
                      <span className="ml-2">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-start mb-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="font-medium mr-2">Location:</span>
                      <span className="flex-1">
                        {request.location?.address}, {request.location?.pincode}
                      </span>
                    </div>

                    {request.repairer && (
                      <div className="flex items-center mb-3">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2" />
                        <div>
                          <div className="font-medium">
                            Repairer: {request.repairer.fullname}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Phone: {request.repairer.phone || "N/A"}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      {request.estimatedPrice > 0 && (
                        <div className="flex items-center mb-3">
                          <IndianRupee className="w-5 h-5 text-emerald-700 mr-2" />
                          <span className="font-medium text-lg text-[#2C2C2C]">
                            Final Amount:
                          </span>
                          <span className="ml-2 text-xl font-bold text-emerald-700">
                            ₹{request.estimatedPrice}
                          </span>
                        </div>
                      )}
                      {request.quotation && request.estimatedPrice === 0 && (
                        <div className="flex items-center mb-3 text-gray-600">
                          <span className="font-medium">Initial Estimate:</span>
                          <span className="ml-2">₹{request.quotation}</span>
                        </div>
                      )}

                      {request.status === "quoted" &&
                      request.estimatedPrice > 0 ? (
                        <>
                          <p className="text-gray-600 text-sm mb-4">
                            Please review the quoted amount by the repairer and
                            decide.
                          </p>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                            <button
                              onClick={() => showAcceptModal(request._id)}
                              className="flex items-center justify-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer text-sm font-medium w-full sm:w-auto"
                            >
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />{" "}
                              Accept Amount
                            </button>
                            <button
                              onClick={() => showRejectModal(request._id)}
                              className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer text-sm font-medium w-full sm:w-auto"
                            >
                              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />{" "}
                              Reject Quote
                            </button>
                          </div>
                        </>
                      ) : request.status === "pending_quote" ? (
                        <div className="flex items-center mb-3 text-emerald-700 text-sm">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="font-medium">
                            Awaiting Repairer's Quotation...
                          </span>
                        </div>
                      ) : request.status === "accepted" &&
                        request.estimatedPrice > 0 ? (
                        <div className="flex items-center mb-3 text-green-700 text-sm">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="font-medium">
                            Quotation Accepted!
                          </span>
                          <span className="ml-2 text-lg font-bold">
                            ₹{request.estimatedPrice}
                          </span>
                        </div>
                      ) : request.status === "rejected" ? (
                        <div className="flex items-center mb-3 text-red-700 text-sm">
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="font-medium">
                            Quotation Rejected.
                          </span>
                          {request.estimatedPrice > 0 && (
                            <span className="ml-2 text-gray-600">
                              Original Quote: ₹{request.estimatedPrice}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0 sm:space-x-2">
                    {request.repairer && (
                      <>
                        <button
                          onClick={() => handleChatClick(request._id)}
                          className="flex items-center justify-center text-emerald-600 hover:text-emerald-800 p-2 rounded-md transition-colors text-sm font-medium border border-emerald-300 hover:bg-emerald-50 w-full sm:w-auto"
                        >
                          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />{" "}
                          Chat
                        </button>
                        {request.repairer.phone && (
                          <a
                            href={`tel:${request.repairer.phone}`}
                            className="flex items-center justify-center text-gray-600 hover:text-gray-800 p-2 rounded-md transition-colors text-sm font-medium border border-gray-300 hover:bg-gray-100 w-full sm:w-auto"
                          >
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />{" "}
                            Call Repairer
                          </a>
                        )}
                      </>
                    )}

                    {request.status === "pending_otp" && (
                      <button
                        onClick={() => showCompletionModal(request._id)}
                        className="flex items-center justify-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer text-sm font-medium w-full sm:w-auto"
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> Confirm
                        Completed & Verify OTP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showConfirmAcceptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-sm text-center font-lexend border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                Confirm Acceptance
              </h3>
              <p className="text-gray-700 text-sm sm:text-base mb-6">
                Are you sure you want to{" "}
                <strong className="text-emerald-600">
                  accept this quotation
                </strong>
                ? This will mark the service as accepted and notify the
                repairer.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleCancelModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptQuoteConfirmed}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md text-sm sm:text-base w-full sm:w-auto"
                >
                  Yes, Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-sm text-center font-lexend border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                Confirm Rejection
              </h3>
              <p className="text-gray-700 text-sm sm:text-base mb-6">
                Are you sure you want to{" "}
                <strong className="text-red-600">reject this quotation</strong>
                ? A rejection fee of ₹150 will be charged.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleCancelModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectQuoteConfirmed}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md text-sm sm:text-base w-full sm:w-auto"
                >
                  Yes, Reject
                </button>
              </div>
            </div>
          </div>
        )}
        {showConfirmCompletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center font-lexend border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-4">
                Confirm Service Completion
              </h3>
              <p className="text-gray-700 text-sm sm:text-base mb-4">
                Are you sure you want to confirm this service as completed? This
                will initiate payment.
              </p>
              <div className="mb-6">
                <label
                  htmlFor="otp"
                  className="block text-left text-[#2C2C2C] font-medium mb-2 text-sm sm:text-base"
                >
                  Enter 6-digit OTP:
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength="6"
                  className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 text-sm sm:text-base ${
                    otpError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-emerald-500"
                  }`}
                  placeholder="e.g., 123456"
                />
                {otpError && (
                  <p className="text-red-500 text-xs sm:text-sm mt-2 text-left">
                    {otpError}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleCancelModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCompletionConfirmed}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md text-sm sm:text-base w-full sm:w-auto"
                >
                  Confirm & Verify
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inprogress;