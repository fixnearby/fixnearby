import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Wrench,
  MapPin,
  User,
  Phone,
  CheckCircle,
  MessageCircle,
  DollarSign,
  Calendar,
  ClipboardList,
  Edit,
  Info,
  Tags,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getRepairerAssignedJobs,
  submitRepairerQuote,
  PendingOtp,
  getRepairerConversationsMap,
  createConversation,
} from "../../../services/apiService.js";

const Inprogress = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quoteInputs, setQuoteInputs] = useState({});
  const [editingQuote, setEditingQuote] = useState({});

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
      combinedJobs.forEach((job) => {
        if (job.status === "pending_quote" || job.status === "quoted") {
          initialQuoteInputs[job._id] = job.estimatedPrice || "";
          initialEditingQuoteState[job._id] = false;
        }
      });
      setQuoteInputs(initialQuoteInputs);
      setEditingQuote(initialEditingQuoteState);
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

  // Handler for submitting a quote
  const handleQuoteSubmit = async (jobId) => {
    const quotation = quoteInputs[jobId];
    if (!quotation || isNaN(quotation) || parseFloat(quotation) <= 0) {
      toast.error("Please enter a valid quote amount.");
      return;
    }

    try {
      await submitRepairerQuote(jobId, parseFloat(quotation));
      toast.success("Quote submitted successfully!");
      setEditingQuote((prev) => ({ ...prev, [jobId]: false }));
      fetchRepairerJobs();
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast.error(error.response?.data?.message || "Failed to submit quote.");
    }
  };

  const toggleEditQuote = (jobId) => {
    setEditingQuote((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
    const jobToEdit = jobs.find((job) => job._id === jobId);
    if (jobToEdit && !editingQuote[jobId]) {
      // If entering edit mode
      setQuoteInputs((prev) => ({
        ...prev,
        [jobId]: jobToEdit.estimatedPrice || "",
      }));
    }
  };

  const handleConfirmCompleted = async (jobId) => {
    try {
      await PendingOtp(jobId);
      toast.success("OTP sent successfully!");
      fetchRepairerJobs();
    } catch (error) {
      console.error("Error completing job:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark job as complete."
      );
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
      window.location.href = `tel:${phoneNumber}`; // Opens phone dialer
    } else {
      toast.error("Customer phone number not available.");
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-blue-600">Loading assigned jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
        <p>Error: {error}</p>
        <button
          onClick={fetchRepairerJobs}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Your Assigned Jobs
      </h1>
      {jobs.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
          You currently have no assigned jobs.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {job.serviceType}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : job.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : job.status === "quoted"
                      ? "bg-purple-100 text-purple-800"
                      : job.status === "pending_quote"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {job.status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{job.description}</p>

              <div className="space-y-3 text-gray-700 mb-6">
                <div className="flex items-center">
                  <Wrench className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Service Type: {job.serviceType}</span>
                </div>
                <div className="flex items-center">
                  <Tags className="w-5 h-5 mr-3 text-blue-500" />
                  <span>
                    Category: { job.category || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Info className="w-5 h-5 mr-3 text-blue-500" />
                  <span>
                    Issue: { job.issue || "N/A"}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                  <span>
                    Assigned:{" "}
                    {job.assignedAt
                      ? format(new Date(job.assignedAt), "M/d/yyyy")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Location: {job.location?.address || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Customer: {job.customer?.fullname || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-blue-500" />
                  <span>
                    Phone: { job.contactInfo || "N/A"}
                  </span>
                </div>
              </div>
              {job.status !== "completed" &&
                job.status !== "cancelled" &&
                job.status !== "rejected" &&
                (job.customer || job.contactInfo) && (
                  <div className="flex justify-evenly space-x-2 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <button
                      onClick={() => handleChat(job._id, job.conversationId)}
                      className="flex-1 flex items-center justify-center p-3 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" /> Chat
                    </button>
                    <button
                      onClick={() =>
                        handleCallCustomer(
                          job.customer?.phone || job.contactInfo
                        )
                      }
                      className="flex-1 flex items-center justify-center p-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={!(job.customer?.phone || job.contactInfo)} // Still disable if no phone number
                    >
                      <Phone className="w-5 h-5 mr-2" /> Call Customer
                    </button>
                  </div>
                )}

              {(job.status === "pending_quote" ||
                (job.status === "quoted" && editingQuote[job._id])) && (
                <div className="mt-4 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 font-semibold mb-2 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />{" "}
                    {job.status === "pending_quote"
                      ? "Submit Your Real Cost Quote:"
                      : "Edit Your Quote:"}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold">₹</span>
                    <input
                      type="number"
                      value={quoteInputs[job._id] || ""}
                      onChange={(e) =>
                        handleQuoteInputChange(job._id, e.target.value)
                      }
                      placeholder="Enter your price"
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleQuoteSubmit(job._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                  {job.quotation &&
                    (job.status === "pending_quote" ||
                      (job.status === "quoted" && !editingQuote[job._id])) && (
                      <p className="text-sm text-gray-600 mt-2">
                        AI Estimate: ₹{job.quotation}
                      </p>
                    )}
                </div>
              )}
              {job.status === "quoted" && !editingQuote[job._id] && (
                <div className="mt-4 p-4 border border-purple-300 bg-purple-50 rounded-lg text-purple-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" /> Your Quote
                      Submitted:
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      ₹{job.estimatedPrice}
                    </p>
                    <p className="text-sm mt-1">
                      Waiting for customer acceptance.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleEditQuote(job._id)}
                    className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    title="Edit Quote"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              )}

              {job.status === "accepted" && (
                <>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <p className="text-green-800 font-semibold flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" /> Quote Accepted:
                      </p>
                      <p className="text-xl font-bold text-green-900">
                        ₹{job.estimatedPrice || job.quotation}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConfirmCompleted(job._id)}
                    className="mt-6 w-full p-4 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Confirm Completion & Send OTP
                  </button>
                </>
              )}

              {job.status === "pending_otp" && (
                <button
                  onClick={() => handleConfirmCompleted(job._id)}
                  className="mt-6 w-full p-4 bg-yellow-600 text-white rounded-xl shadow-md hover:bg-yellow-700 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Resend OTP
                </button>
              )}
              {job.status === "completed" && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-gray-700 text-center">
                  <p className="font-semibold">Job Completed</p>
                  <p className="text-sm">Thank you for your service!</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inprogress;
