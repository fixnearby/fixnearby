import React, { useState, useEffect } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import { Star, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { getServiceRequestById, submitServiceReview } from '../../../services/apiService';

const ReviewPage = () => {
    const { serviceRequestId } = useParams();
    const navigate = useNavigate();

    const [serviceDetails, setServiceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getServiceRequestById(serviceRequestId);
                if (response && !response.message) { // Assuming success if no 'message' field
                    setServiceDetails(response);
                    // If service already has a rating, pre-fill it and show success message
                    if (response.rating && response.rating.stars) {
                        setStars(response.rating.stars);
                        setComment(response.rating.comment || '');
                        setReviewSuccess(true);
                        setReviewMessage("This service has already been reviewed.");
                    }
                } else {
                    setError(response?.message || "Failed to fetch service details.");
                }
            } catch (err) {
                console.error("Error fetching service details:", err);
                setError("Failed to load service details for review.");
            } finally {
                setLoading(false);
            }
        };

        if (serviceRequestId) {
            fetchServiceDetails();
        }
    }, [serviceRequestId]);

    const handleStarClick = (selectedStars) => {
        setStars(selectedStars);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (stars === 0) {
            setError("Please select a star rating.");
            return;
        }

        setSubmitting(true);
        setReviewSuccess(false);
        setReviewMessage('');
        setError(null);

        try {
            const reviewData = { stars, comment };
            const response = await submitServiceReview(serviceRequestId, reviewData);

            if (response.success) {
                setReviewSuccess(true);
                setReviewMessage(response.message || "Review submitted successfully!");
                alert("Review submitted successfully!");
                // Optionally navigate after a short delay
                setTimeout(() => navigate('/user/inprogress'), 1500); 
            } else {
                setError(response.message || "Failed to submit review.");
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            setError("An unexpected error occurred during review submission.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="ml-2 text-lg text-gray-700">Loading service details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
                <p className="text-red-600 text-center">{error}</p>
                <Link to="/user/inprogress" className="mt-6 flex items-center text-blue-600 hover:text-blue-800">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to In-Progress Services
                </Link>
            </div>
        );
    }

    if (!serviceDetails) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <p className="text-xl text-gray-700">Service details could not be loaded.</p>
                <Link to="/user/in-progress" className="mt-6 flex items-center text-blue-600 hover:text-blue-800">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to In-Progress Services
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-lg text-center transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-6">
                    <Star className="w-20 h-20 text-purple-600 animate-pulse" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    Review Your Service
                </h1>
                <p className="text-lg text-gray-700 mb-2">
                    Service: <span className="font-semibold text-purple-700">{serviceDetails.title || 'N/A'}</span>
                </p>
                {serviceDetails.repairer && (
                    <p className="text-md text-gray-600 mb-6">
                        Repairer: <span className="font-medium">{serviceDetails.repairer.fullname || 'N/A'}</span>
                    </p>
                )}

                {reviewSuccess ? (
                    <div className="bg-green-100 text-green-700 px-6 py-3 rounded-lg text-lg font-semibold flex items-center justify-center animate-fade-in mb-6">
                        <CheckCircle className="w-6 h-6 mr-2" /> {reviewMessage}
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview} className="w-full">
                        <div className="mb-6">
                            <label className="block text-xl font-medium text-gray-700 mb-3">Rate your experience:</label>
                            <div className="flex justify-center space-x-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-10 h-10 cursor-pointer transition-colors duration-200 
                                            ${s <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'}`}
                                        onClick={() => handleStarClick(s)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="comment" className="block text-xl font-medium text-gray-700 mb-3">
                                Add a comment (optional):
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="4"
                                maxLength="500"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                                placeholder="Share your experience..."
                            ></textarea>
                            <p className="text-sm text-gray-500 text-right">{comment.length}/500</p>
                        </div>

                        {error && (
                            <div className="text-red-600 text-md mb-4 flex items-center justify-center">
                                <XCircle className="w-5 h-5 mr-2" /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || stars === 0}
                            className={`flex items-center justify-center px-8 py-3 rounded-lg text-xl font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl w-full
                                ${submitting || stars === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </form>
                )}

                <Link
                    to="/user/inprogress"
                    className="flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 mt-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to In-Progress Services
                </Link>
            </div>
        </div>
    );
};

export default ReviewPage;