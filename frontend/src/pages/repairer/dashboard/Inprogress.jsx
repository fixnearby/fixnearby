// frontend/src/components/RepairerDashboard/Inprogress.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getRepairerAssignedJobs,
  submitRepairerQuote,
  PendingOtp,
  getRepairerConversationsMap,
  createConversation,
} from "../../../services/apiService.js";
import InprogressJobCard from '../../../components/RepairerDashboard/InprogressJobCard.jsx';
import LoadingSpinner from "../../../components/LoadingSpinner.jsx";
import { AlertCircle, ClipboardCheck, ArrowLeft } from "lucide-react";

const Inprogress = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quoteInputs, setQuoteInputs] = useState({});
  const [editingQuote, setEditingQuote] = useState({});
  const [isSubmittingQuote, setIsSubmittingQuote] = useState({});
  const [isSendingOtp, setIsSendingOtp] = useState({});


  const fetchRepairerJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, conversationsMap] = await Promise.all([
        getRepairerAssignedJobs(),
        getRepairerConversationsMap(),
      ]);
      const combinedJobs = jobsData.map((job) => ({
        ...job,
        conversationId: conversationsMap[job._id] || null,
      }));

      setJobs(combinedJobs);
      const initialQuoteInputs = {};
      const initialEditingQuoteState = {};
      const initialSubmittingQuoteState = {};
      const initialSendingOtpState = {};

      combinedJobs.forEach((job) => {
        if (job.status === "pending_quote" || job.status === "quoted") {
          initialQuoteInputs[job._id] = job.estimatedPrice || "";
          initialEditingQuoteState[job._id] = false;
        }
        initialSubmittingQuoteState[job._id] = false;
        initialSendingOtpState[job._id] = false;
      });
      setQuoteInputs(initialQuoteInputs);
      setEditingQuote(initialEditingQuoteState);
      setIsSubmittingQuote(initialSubmittingQuoteState);
      setIsSendingOtp(initialSendingOtpState);

    } catch (err) {
      console.error("Error fetching repairer jobs or conversations:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch assigned jobs or conversations."
      );
      toast.error(
        err.response?.data?.message || "Failed to load assigned jobs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepairerJobs();
  }, [fetchRepairerJobs]);

  const handleQuoteInputChange = (jobId, value) => {
    setQuoteInputs((prev) => ({
      ...prev,
      [jobId]: value,
    }));
  };

  const handleQuoteSubmit = async (jobId) => {
    const quotation = quoteInputs[jobId];
    if (!quotation || isNaN(quotation) || parseFloat(quotation) <= 0) {
      toast.error("Please enter a valid quote amount.");
      return;
    }

    setIsSubmittingQuote((prev) => ({ ...prev, [jobId]: true }));
    try {
      await submitRepairerQuote(jobId, parseFloat(quotation));
      toast.success("Quote submitted successfully!");
      setEditingQuote((prev) => ({ ...prev, [jobId]: false }));
      fetchRepairerJobs();
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast.error(error.response?.data?.message || "Failed to submit quote.");
    } finally {
      setIsSubmittingQuote((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const toggleEditQuote = (jobId) => {
    setEditingQuote((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
    const jobToEdit = jobs.find((job) => job._id === jobId);
    if (jobToEdit && !editingQuote[jobId]) {
      setQuoteInputs((prev) => ({
        ...prev,
        [jobId]: jobToEdit.estimatedPrice || "",
      }));
    }
  };
  const handleConfirmCompleted = async (jobId) => {
    setIsSendingOtp((prev) => ({ ...prev, [jobId]: true }));
    try {
      await PendingOtp(jobId);
      toast.success("OTP sent successfully!");
      fetchRepairerJobs();
    } catch (error) {
      console.error("Error completing job:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark job as complete."
      );
    } finally {
      setIsSendingOtp((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleChat = async (jobId, existingConversationId) => {
    let finalConversationId = existingConversationId;

    if (!finalConversationId) {
      toast.loading("Initiating chat...", { id: "chat-init" });
      try {
        const response = await createConversation(jobId);
        finalConversationId = response.conversationId;
        toast.success("Chat initiated!", { id: "chat-init" });
        fetchRepairerJobs();
      } catch (error) {
        console.error("Error creating conversation:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to initiate chat. Please ensure the job is assigned and try again.",
          { id: "chat-init" }
        );
        return;
      }
    }

    if (finalConversationId) {
      navigate(`/repairer/messages/${finalConversationId}`);
    } else {
      toast.error("Conversation ID is still missing. Cannot open chat.");
    }
  };

  const handleCallCustomer = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error("Customer phone number not available.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <LoadingSpinner message="Loading your assigned jobs..." />
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
          <button
            onClick={fetchRepairerJobs}
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Retry Loading Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen font-lexend">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-x-4 mb-8">
          <Link
            to="/repairer/dashboard"
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

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C2C2C] flex-grow">
            Your Assigned Jobs
          </h1>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center text-gray-700 flex flex-col items-center justify-center">
            <ClipboardCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-2">
              No Assigned Jobs Yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              You currently have no jobs assigned to you. Keep an eye on the
              dashboard for new service requests!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <InprogressJobCard
                key={job._id}
                job={job}
                quoteInputs={quoteInputs}
                editingQuote={editingQuote}
                handleQuoteInputChange={handleQuoteInputChange}
                handleQuoteSubmit={handleQuoteSubmit}
                toggleEditQuote={toggleEditQuote}
                handleConfirmCompleted={handleConfirmCompleted}
                handleChat={handleChat}
                handleCallCustomer={handleCallCustomer}
                isSubmittingQuote={isSubmittingQuote}
                isSendingOtp={isSendingOtp}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inprogress;