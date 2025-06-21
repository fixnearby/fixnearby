// backend/controllers/user.controller.js
import User from "../models/user.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";
import Otp from "../models/otp.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../libs/utils.js";
import ServiceRequest from "../models/serviceRequest.model.js";
import Notification from "../models/notification.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Repairer from "../models/repairer.model.js"; 
import Payment from "../models/payment.model.js"; 
import { sendSignupOTP } from "./sendsms.js";
import Razorpay from 'razorpay'; 
import AcceptOtp from "../models/acceptOtp.model.js";
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const formatLocationData = (location) => {
    if (!location) return null;
    return {
        fullAddress: location.fullAddress || '',
        pincode: location.pincode || '',
        city: location.city || '',
        state: location.state || '',
        coordinates: location.coordinates || [],
        captureMethod: location.captureMethod || ''
    };
};



function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const getOtp = async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone Number is required" });
    const user = await User.findOne({ phone });
    if (user) return res.status(400).json({ message: "User with this phone already exists" });
    const otp_generated = generateOTP();
    try {
        await Otp.findOneAndUpdate({ phone }, {
            phone,
            otp: otp_generated,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }, { upsert: true, new: true });
        const status = await sendSignupOTP(phone, otp_generated);
        if (status === false) {
            return res.status(500).json({ message: "Failed to send OTP" });
        }
        return res.status(200).json({ message: "OTP sent to phone" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
};

export const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: "Phone Number and OTP are required" });
    try {
        const record = await Otp.findOne({ phone });
        if (!record) return res.status(400).json({ message: "No OTP found for this phone" });
        if (record.otp !== otp) return res.status(400).json({ message: "Invalid verification code." });
        if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired. Please request a new one." });
        await Otp.deleteOne({ phone });
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "OTP verification failed" });
    }
};

export const signup = async (req, res) => {
    const { fullname, password, phone } = req.body;
    try {
        if (!fullname || !password || !phone) {
            return res.status(400).json({ message: "All required fields (fullname, password, phone) must be filled" });
        }
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: "User with this phone already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullname,
            password: hashedPassword,
            phone,
        });
        await newUser.save();

        generateToken(newUser._id, "user", res);

        res.status(201).json({
            _id: newUser._id,
            fullname: newUser.fullname,
            phone: newUser.phone,
            role: "user",
            message: "User account created successfully!",
        });
    } catch (error) {
        console.error("Error in signupUser controller:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: "Internal Server Error during signup. Please try again." });
    }
};

export const login = async (req, res) => {
    const { phone, password } = req.body;
    try {
        const user = await User.findOne({ phone }).select("+password");
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        generateToken(user._id, "user", res);

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            phone: user.phone,
            role: "user",
        });
    } catch (error) {
        console.error("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies?.jwt;
        if (!token) return res.status(400).json({ message: "No token found in cookies" });
        await BlacklistToken.create({ token });
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "Lax",
            secure: process.env.NODE_ENV === 'production',
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Server error during logout" });
    }
};

export const getDashboardStats = async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    try {
        const totalServices = await ServiceRequest.countDocuments({ customer: userId });
        const completedServices = await ServiceRequest.countDocuments({ customer: userId, status: 'completed' });
        const inProgressServices = await ServiceRequest.countDocuments({
            customer: userId,
            status: { $in: ['accepted', 'in_progress', 'quoted', 'pending_quote'] }
        });

        res.status(200).json({
            totalServices,
            completedServices,
            inProgressServices,
        });
    } catch (error) {
        console.error("Error fetching user dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats." });
    }
};

export const getRecentActivity = async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    try {
        const recentServiceRequests = await ServiceRequest.find({ customer: userId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('repairer', 'fullname')
            .lean();

        const activity = recentServiceRequests.map(sr => {
            let message = "";
            let type = "";

            const diffMs = new Date() - sr.updatedAt;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            let timeAgo = '';
            if (diffMins < 60) {
                timeAgo = `${diffMins} mins ago`;
            } else if (diffHours < 24) {
                timeAgo = `${diffHours} hours ago`;
            } else {
                timeAgo = `${diffDays} days ago`;
            }

            if (sr.status === 'completed') {
                type = "completed";
                message = `Service "${sr.title}" completed by ${sr.repairer?.fullname || 'a repairer'}`;
            } else if (sr.status === 'in_progress') {
                type = "in_progress";
                message = `Service "${sr.title}" is in progress with ${sr.repairer?.fullname || 'a repairer'}`;
            } else if (sr.status === 'accepted') {
                type = "accepted";
                message = `Service "${sr.title}" accepted by ${sr.repairer?.fullname || 'a repairer'}`;
            } else if (sr.status === 'quoted') {
                type = "quoted";
                message = `Quotation received for "${sr.title}" from ${sr.repairer?.fullname || 'a repairer'}`;
            } else if (sr.status === 'requested') {
                type = "new_request";
                message = `New service request placed: "${sr.title}"`;
            } else if (sr.status === 'cancelled') {
                type = "cancelled";
                message = `Service "${sr.title}" was cancelled`;
            } else {
                type = "updated";
                message = `Service "${sr.title}" updated`;
            }

            return {
                type,
                message,
                time: timeAgo,
            };
        });

        res.status(200).json(activity);
    } catch (error) {
        console.error("Error fetching user recent activity:", error);
        res.status(500).json({ message: "Failed to fetch recent activity." });
    }
};


export const requestService = async (req, res) => {
    const userId = req.user?._id;
    const {
        title,
        description,
        serviceType,
        urgency,
        location,
        preferredDate,
        preferredTime,
        quotation,
        estimatedPrice,
        attachments,
        category,
        issue,
        budget,
        contactInfo
    } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    if (!title || !description || !serviceType || !urgency || !location || !location.address || !location.pincode ||
        !category || !issue || !budget || !contactInfo || !preferredDate || !preferredTime) {
        return res.status(400).json({
            message: "Please provide all required service request fields: title, description, serviceType, urgency, location (address, pincode, captureMethod), category, issue, budget, contactInfo, preferredDate, and preferredTime."
        });
    }


    try {
        const newServiceRequest = new ServiceRequest({
            customer: userId,
            title,
            description,
            serviceType,
            urgency,
            location,
            preferredTimeSlot: {
                date: new Date(preferredDate),
                time: preferredTime
            },
            quotation,
            estimatedPrice,
            attachments,
            category,
            issue,
            budget,
            contactInfo,
            status: 'requested',
        });

        await newServiceRequest.save();

        res.status(201).json({ message: "Service request created successfully!", serviceRequest: newServiceRequest });
    } catch (error) {
        console.error("Error creating service request:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: "Failed to create service request." });
    }
};


export const getInProgressServices = async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    try {
        console.log('--- DEBUG: getInProgressServices (user.controller.js) called ---');
        console.log('DEBUG: User ID:', userId);
        const payoutsInitiatedPayments = await Payment.find({
            customer: userId, 
            status: { $in: ['payout_initiated', 'payout_completed'] }
        }).select('serviceRequest').lean();
        const serviceRequestIdsToExclude = payoutsInitiatedPayments.map(payment => payment.serviceRequest);
        console.log('DEBUG: ServiceRequest IDs to exclude (payout initiated/completed):', serviceRequestIdsToExclude);
        let query = {
            customer: userId,
            status: { $in: ['requested', 'pending_quote', 'quoted', 'accepted', 'in_progress', 'pending_otp'] }, 
            _id: { $nin: serviceRequestIdsToExclude } 
        };

        const inProgressServices = await ServiceRequest.find(query)
            .populate('repairer', 'fullname phone businessName')
            .sort({ createdAt: -1 })
            .lean();

        console.log('DEBUG: Number of In Progress Service Requests found:', inProgressServices.length);
        if (inProgressServices.length > 0) {
            inProgressServices.forEach((reqItem, index) => {
                console.log(`DEBUG: [${index}] Service ID: ${reqItem._id}, Status: ${reqItem.status}, Title: ${reqItem.title}`);
            });
        } else {
            console.log('DEBUG: No in-progress service requests found for this user/query.');
        }

        const formattedServices = inProgressServices.map(sr => ({
            _id: sr._id,
            title: sr.title,
            description: sr.description,
            serviceType: sr.serviceType,
            status: sr.status,
            urgency: sr.urgency,
            location: formatLocationData(sr.location),
            preferredDate: sr.preferredTimeSlot?.date ? sr.preferredTimeSlot.date.toISOString().split('T')[0] : null,
            preferredTime: sr.preferredTimeSlot?.time || null,
            quotation: sr.quotation,
            estimatedPrice: sr.estimatedPrice,
            assignedRepairer: sr.repairer ? {
                _id: sr.repairer._id,
                fullname: sr.repairer.fullname,
                phone: sr.repairer.phone,
                businessName: sr.repairer.businessName
            } : null,
            createdAt: sr.createdAt,
            updatedAt: sr.updatedAt,
        }));

        res.status(200).json(formattedServices);
    } catch (error) {
        console.error("Error fetching in-progress services:", error);
        res.status(500).json({ message: "Failed to fetch in-progress services." });
    }
};
export const getPendingServices = async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    try {
        const pendingServices = await ServiceRequest.find({
            customer: userId,
            status: { $in: ['requested', 'pending_quote'] }
        })
            .sort({ createdAt: -1 })
            .lean();

        const formattedServices = pendingServices.map(sr => ({
            _id: sr._id,
            title: sr.title,
            description: sr.description,
            serviceType: sr.serviceType,
            status: sr.status,
            urgency: sr.urgency,
            location: formatLocationData(sr.location),
            preferredDate: sr.preferredTimeSlot?.date ? sr.preferredTimeSlot.date.toISOString().split('T')[0] : null,
            preferredTime: sr.preferredTimeSlot?.time || null,
            quotation: sr.quotation,
            estimatedPrice: sr.estimatedPrice,
            createdAt: sr.createdAt,
            updatedAt: sr.updatedAt,
        }));

        res.status(200).json(formattedServices);
    } catch (error) {
        console.error("Error fetching pending services:", error);
        res.status(500).json({ message: "Failed to fetch pending services." });
    }
};


export const cancelJob = async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user?._id;

    if (!jobId || !userId) {
        return res.status(400).json({ message: "Job ID and User ID are required." });
    }

    try {
        const serviceRequest = await ServiceRequest.findOne({ _id: jobId, customer: userId });

        if (!serviceRequest) {
            return res.status(404).json({ message: "Service Request not found or you are not authorized to cancel this job." });
        }

        const cancellableStatuses = ['requested', 'accepted', 'in_progress', 'quoted', 'pending_quote'];
        if (!cancellableStatuses.includes(serviceRequest.status)) {
            return res.status(400).json({ message: `Job cannot be cancelled in '${serviceRequest.status}' status.` });
        }

        serviceRequest.status = 'cancelled';
        serviceRequest.cancelledAt = new Date();
        await serviceRequest.save();

        if (serviceRequest.repairer) {
            await Notification.create({
                recipient: serviceRequest.repairer,
                recipientModel: 'Repairer',
                type: 'job_cancelled',
                message: `Service "${serviceRequest.title}" was cancelled by the customer.`,
                link: `/repairer/dashboard`,
                relatedEntity: {
                    id: jobId,
                    model: 'ServiceRequest'
                }
            });
        }

        res.status(200).json({ message: `Service Request ${jobId} cancelled successfully!` });
    } catch (error) {
        console.error("Error cancelling service request:", error);
        res.status(500).json({ message: "Failed to cancel service request." });
    }
};


export const getUserConversations = async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    try {
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'lastMessage',
                select: 'text createdAt senderId'
            })
            .populate({
                path: 'serviceRequest',
                select: 'title repairer status',
                populate: {
                    path: 'repairer',
                    select: 'fullname' // This will be null if the repairer account is deleted
                }
            })
            .sort({ updatedAt: -1 })
            .lean();

        const formattedConversations = conversations.map(conv => {
            const serviceRequest = conv.serviceRequest;
            const repairerParticipant = serviceRequest?.repairer; // This can be null if repairer is deleted

            let otherParticipantName;
            if (repairerParticipant && repairerParticipant.fullname) {
                otherParticipantName = repairerParticipant.fullname;
            } else if (repairerParticipant && repairerParticipant._id) {
                // Fallback if fullname is missing but ID exists (less likely for deleted)
                otherParticipantName = `Repairer (ID: ${repairerParticipant._id.toString().substring(0, 4)})`;
            } else {
                // If repairerParticipant is null/undefined (account deleted), use a generic fallback
                otherParticipantName = `Repairer (Account Deleted)`;
                // You could also add the service ID here if you want:
                // otherParticipantName = `Repairer (Deleted for Job ${serviceRequest?._id?.toString().substring(0, 4)})`;
            }

            const isChatActive = serviceRequest && !['completed', 'cancelled', 'rejected'].includes(serviceRequest.status);

            return {
                id: conv._id.toString(),
                serviceId: serviceRequest?._id.toString(),
                title: serviceRequest?.title || 'Unknown Service Request',
                sender: otherParticipantName,
                lastMessage: conv.lastMessage?.text || 'No messages yet.',
                time: conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unread: false,
                isActive: isChatActive
            };
        });

        res.status(200).json(formattedConversations);
    } catch (error) {
        console.error("Error fetching user conversations:", error);
        res.status(500).json({ message: "Failed to fetch conversations." });
    }
};


export const getConversationMessages = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user?._id;

    if (!conversationId || !userId) {
        return res.status(400).json({ message: "Conversation ID and User ID are required." });
    }

    try {
        const conversation = await Conversation.findById(conversationId).populate('serviceRequest', 'status');

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        if (!conversation.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({ message: "You are not a participant in this conversation." });
        }

        const serviceRequest = conversation.serviceRequest;
        if (!serviceRequest || ['completed', 'cancelled', 'rejected'].includes(serviceRequest.status)) {
            return res.status(200).json({
                conversationId: conversation._id,
                messages: [],
                chatEnded: true,
                chatEndedReason: `Chat is no longer active for this job. Job status is ${serviceRequest?.status || 'unknown'}.`
            });
        }

        const messages = await Message.find({ conversation: conversation._id })
            .sort({ createdAt: 1 })
            .lean();

        const populatedMessages = await Promise.all(messages.map(async (msg) => {
            let senderName = "Unknown"; 

            if (msg.senderModel === "Repairer") {
                const sender = await Repairer.findById(msg.senderId).select('fullname').lean();
                senderName = sender?.fullname || "Deleted Repairer"; 
            } else if (msg.senderModel === "User") {
                const sender = await User.findById(msg.senderId).select('fullname').lean();
                senderName = sender?.fullname || "Deleted User"; 
            }
            return { ...msg, senderName };
        }));

        res.status(200).json({
            conversationId: conversation._id,
            messages: populatedMessages,
            chatEnded: false
        });

    } catch (error) {
        console.error("Error fetching conversation messages:", error);
        res.status(500).json({ message: "Failed to fetch messages for conversation." });
    }
};

export const createRazorpayOrder = async (req, res) => {
    const userId = req.user?._id;
    const { paymentRecordId } = req.body;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    try {
        const payment = await Payment.findById(paymentRecordId).populate('serviceRequest');

        if (!payment || payment.customer.toString() !== userId.toString()) {
            console.error(`[createRazorpayOrder] Payment record ${paymentRecordId} not found or unauthorized for user ${userId}.`);
            return res.status(404).json({ success: false, message: "Payment record not found or unauthorized." });
        }

        if (payment.status !== 'created' && payment.status !== 'pending') {
            console.warn(`[createRazorpayOrder] Payment record ${paymentRecordId} is in status '${payment.status}', not 'created' or 'pending'.`);
            return res.status(400).json({ success: false, message: `Payment is already in '${payment.status}' status.` });
        }

        let amountInPaisa;
        if (payment.paymentMethod === 'rejection_fee') {
             amountInPaisa = Math.round(payment.amount);
        } else {
             amountInPaisa = Math.round(payment.amount * 100);
        }

        if (amountInPaisa < 100) {
            console.error(`[createRazorpayOrder] Invalid amount for Razorpay order: ${amountInPaisa} paise. Minimum is 100 paise.`);
            return res.status(400).json({ success: false, message: "Payment amount too small. Minimum is ₹1." });
        }

        const order = await razorpayInstance.orders.create({
            amount: amountInPaisa,
            currency: 'INR',
            receipt: payment._id.toString(),
            notes: {
                service_request_id: payment.serviceRequest?._id.toString(),
                payment_record_id: payment._id.toString()
            },
        });

        console.log("[createRazorpayOrder] Razorpay order created:", order);

        payment.razorpayOrderId = order.id;
        payment.status = 'pending';
        await payment.save();

        console.log(`[createRazorpayOrder] Payment record ${payment._id} updated with Razorpay order ID ${order.id}.`);

        const customer = await User.findById(payment.customer);
        const serviceTitle = payment.serviceRequest?.title || 'Service Payment';

        res.status(200).json({
            success: true,
            message: "Razorpay order created successfully.",
            data: {
                orderId: order.id,
                currency: order.currency,
                amount: order.amount,
                razorpayKey: process.env.RAZORPAY_KEY_ID,
                serviceTitle: serviceTitle,
                customerName: customer?.fullname,
                customerPhone: customer?.phone,
                paymentRecordId: payment._id,
            }
        });

    } catch (error) {
        console.error("[createRazorpayOrder] Error creating Razorpay order:", error.message, error.response?.data);
        res.status(500).json({ success: false, message: "Failed to create Razorpay order. " + (error.message || "Please try again.") });
    }
};

export const verifyAndTransferPayment = async (req, res) => {

    const userId = req.user?._id;

    const {

    razorpay_order_id,

    razorpay_payment_id,

    razorpay_signature,

    paymentRecordId

    } = req.body;



    if (!userId) {

    console.error("Verify Payment: Unauthorized - User ID not found.");

    return res.status(401).json({ success: false, message: "Unauthorized: User ID not found." });

    }



    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentRecordId) {

    console.error("Verify Payment: Incomplete details received.", { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentRecordId });

    return res.status(400).json({ success: false, message: "Payment verification details are incomplete." });

    }



    try {

    const paymentRecord = await Payment.findById(paymentRecordId)

    .populate('serviceRequest')

    .populate('repairer', 'upiId fullname phone email'); // Added 'fullname' to populate



    if (!paymentRecord || paymentRecord.customer.toString() !== userId.toString()) {

    console.error(`Verify Payment: Payment record ${paymentRecordId} not found or unauthorized for user ${userId}.`);

    return res.status(404).json({ success: false, message: "Payment record not found or unauthorized." });

    }

    if (!paymentRecord.repairer && paymentRecord.paymentMethod !== 'rejection_fee') {

    console.error(`Verify Payment: Repairer details missing for payout for payment type ${paymentRecord.paymentMethod}.`);

    paymentRecord.status = 'payout_failed_contact_issue';
    await paymentRecord.save();

    return res.status(400).json({ success: false, message: "Repairer details are missing for payout. Please contact support." });

    }

    if (paymentRecord.repairer && (!paymentRecord.repairer.phone || !paymentRecord.repairer.upiId)) {

    console.error(`Verify Payment: Repairer phone or UPI ID missing for payout:`, paymentRecord.repairer);

    paymentRecord.status = 'payout_failed_contact_issue';

    await paymentRecord.save();

    return res.status(400).json({ success: false, message: "Repairer phone number or UPI ID is missing for payout." });

    }





    console.log('\n--- Razorpay Signature Verification Debug ---');

    console.log('Backend received:');

    console.log(' paymentRecordId:', paymentRecordId);

    console.log(' razorpay_order_id:', razorpay_order_id);

    console.log(' razorpay_payment_id:', razorpay_payment_id);

    console.log(' razorpay_signature (from client):', razorpay_signature);



    const stringToHash = `${razorpay_order_id}|${razorpay_payment_id}`;

    console.log(' String used for HMAC calculation:', stringToHash);



    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);

    shasum.update(stringToHash);

    const digest = shasum.digest('hex');

    console.log(' Calculated digest (from your backend):', digest);



    if (digest !== razorpay_signature) {

    paymentRecord.status = 'failed';

    await paymentRecord.save();

    console.error(`Verify Payment: Signature Mismatch for Payment ID: ${razorpay_payment_id}. Stored status: ${paymentRecord.status}`);

    console.error(`Expected Digest (calculated): ${digest}`);

    console.error(`Received Signature (from Razorpay): ${razorpay_signature}`);

    return res.status(400).json({ success: false, message: "Payment verification failed: Signature mismatch." });

    }
    let actualRazorpayAmount = 0;

    try {

    const paymentDetailsFromRazorpay = await razorpayInstance.payments.fetch(razorpay_payment_id);

    actualRazorpayAmount = paymentDetailsFromRazorpay.amount;

    console.log(`[verifyAndTransferPayment] Fetched Razorpay payment details. Status: ${paymentDetailsFromRazorpay.status}, Amount: ${actualRazorpayAmount} paise.`);



    if (paymentDetailsFromRazorpay.status === 'authorized') {
    await razorpayInstance.payments.capture(razorpay_payment_id, actualRazorpayAmount);

    console.log(`[verifyAndTransferPayment] Payment ${razorpay_payment_id} captured successfully.`);

    } else if (paymentDetailsFromRazorpay.status === 'captured') {

    console.log(`[verifyAndTransferPayment] Payment ${razorpay_payment_id} already captured.`);

    } else if (paymentDetailsFromRazorpay.status !== 'captured' && paymentDetailsFromRazorpay.status !== 'authorized') {


    paymentRecord.status = paymentDetailsFromRazorpay.status;

    await paymentRecord.save();

    return res.status(400).json({ success: false, message: `Payment in Razorpay is in ${paymentDetailsFromRazorpay.status} status. Cannot proceed.` });

    }
    if (Math.round(paymentRecord.amount * 100) !== actualRazorpayAmount) {

    console.error(`[verifyAndTransferPayment] Amount mismatch! DB: ${paymentRecord.amount} Rs (${paymentRecord.amount * 100} paise), Razorpay: ${actualRazorpayAmount} paise`);
    }


    } catch (fetchCaptureError) {

    console.error(`[verifyAndTransferPayment] Error fetching or capturing payment ${razorpay_payment_id}:`, fetchCaptureError.message || fetchCaptureError.error?.description || fetchCaptureError);

    paymentRecord.status = 'failed';

    await paymentRecord.save();

    return res.status(500).json({ success: false, message: "Failed to verify payment with Razorpay. Please contact support." });

    }

    if (paymentRecord.status !== 'captured' && paymentRecord.status !== 'payout_initiated' && paymentRecord.status !== 'payout_completed') {

    paymentRecord.razorpayPaymentId = razorpay_payment_id;

    paymentRecord.razorpaySignature = razorpay_signature;

    paymentRecord.status = 'captured';

    paymentRecord.paymentDate = new Date();

    console.log('--- DEBUG: Razorpay Payment Verified & Captured ---');

    console.log('DEBUG: Payment Record ID:', paymentRecord._id);

    console.log('DEBUG: Service Request ID:', paymentRecord.serviceRequest?._id);

    console.log('DEBUG: Status updated to:', paymentRecord.status);

    } else {

    console.log(`DEBUG: Payment record already processed (status: ${paymentRecord.status}). Skipping capture update.`);

    }
    if (paymentRecord.repairer && paymentRecord.repairer.upiId && paymentRecord.repairerPayoutAmount > 0) { // Only proceed with payout if repairer exists, has UPI, and amount > 0

    let contactId;

    let fundAccountId;


    try {
    const contactsResponse = await razorpayInstance.contacts.all({

    contact: paymentRecord.repairer.phone

    });



    if (contactsResponse.items && contactsResponse.items.length > 0) {

    contactId = contactsResponse.items[0].id;

    console.log(`DEBUG: Found existing Razorpay Contact: ${contactId} for Repairer Phone: ${paymentRecord.repairer.phone}`);

    } else {

    console.log(`DEBUG: No existing contact found for Repairer Phone: ${paymentRecord.repairer.phone}. Creating new one...`);

    const newContact = await razorpayInstance.contacts.create({

    name: paymentRecord.repairer.fullname || `Repairer-${paymentRecord.repairer._id.toString().substring(0, 8)}`,

    email: paymentRecord.repairer.email || undefined, 

    contact: paymentRecord.repairer.phone,

    type: 'vendor',

    reference_id: paymentRecord.repairer._id.toString(), 

    });

    contactId = newContact.id;

    console.log(`DEBUG: Created new Razorpay Contact: ${contactId}`);

    }

    console.log('-------------------------------------------\n');



    } catch (contactError) {

    console.error("Error managing Razorpay Contact (SDK):", contactError.error?.description || contactError.message || contactError);

    paymentRecord.status = 'payout_failed_contact_issue';

    await paymentRecord.save();

    return res.status(500).json({ success: false, message: contactError.error?.description || "Payment verified, but failed to set up repairer contact. Please contact support immediately." });

    }

    try {

    console.log('\n--- DEBUG: Payout Process - Fund Account (Razorpay SDK) ---');

    console.log(`DEBUG: Attempting to create fund account for UPI ID: ${paymentRecord.repairer.upiId} for Contact: ${contactId}`);


    const newFundAccount = await razorpayInstance.fundAccounts.create({

    account_type: "vpa",

    vpa: {

    address: paymentRecord.repairer.upiId

    },

    contact_id: contactId,

    });

    fundAccountId = newFundAccount.id;

    console.log(`DEBUG: Fund Account created/retrieved: ${fundAccountId} for UPI ID: ${paymentRecord.repairer.upiId}`);

    console.log('-------------------------------------------\n');



    } catch (fundAccountError) {

    console.error("Error managing Razorpay Fund Account (SDK):", fundAccountError.error?.description || fundAccountError.message || fundAccountError);

    paymentRecord.status = 'payout_failed_fundaccount_issue';

    await paymentRecord.save();

    return res.status(500).json({ success: false, message: fundAccountError.error?.description || "Payment verified, but failed to set up repairer payout account. Please contact support immediately." });

    }
    try {

    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || 3);

    let amountForPayoutInPaise;



    if (paymentRecord.paymentMethod === 'rejection_fee') {

    amountForPayoutInPaise = Math.round(paymentRecord.amount);

    console.log(`[verifyAndTransferPayment] Payout for rejection_fee: ${amountForPayoutInPaise} paise`);

    } else {

    const amountInRupees = paymentRecord.amount;

    const platformFeeAmount = amountInRupees * (platformFeePercentage / 100);

    const repairerShareInRupees = amountInRupees - platformFeeAmount;

    amountForPayoutInPaise = Math.round(repairerShareInRupees * 100);

    paymentRecord.platformFeeAmount = platformFeeAmount;

    paymentRecord.repairerPayoutAmount = amountForPayoutInPaise; // Store in paise for consistency with Razorpay

    console.log(`[verifyAndTransferPayment] Platform Fee Percentage: ${platformFeePercentage}%`);

    console.log(`[verifyAndTransferPayment] Platform Fee Amount (Rupees): ${platformFeeAmount.toFixed(2)}`);

    console.log(`[verifyAndTransferPayment] Repairer Payout Amount (Paise for Razorpay): ${amountForPayoutInPaise}`);

    }



    if (amountForPayoutInPaise <= 0) {

    console.warn(`[verifyAndTransferPayment] Payout amount is zero or negative (${amountForPayoutInPaise} paise). Skipping payout.`);

    paymentRecord.status = 'payout_skipped'; 

    await paymentRecord.save();



    const serviceRequest = await ServiceRequest.findById(paymentRecord.serviceRequest._id);

    if (serviceRequest && (serviceRequest.status === 'quoted' || serviceRequest.status === 'pending_payment')) {

    serviceRequest.status = 'in_progress'; 

    await serviceRequest.save();

    console.log(`DEBUG: Service Request ${serviceRequest._id} status updated to 'in_progress' (payout skipped).`);

    }

    return res.status(200).json({

    success: true,

    message: "Payment verified successfully. No payout needed due to zero or negative amount.",

    paymentRecord: paymentRecord,

    serviceRequestStatus: serviceRequest?.status

    });

    }





    const payout = await razorpayInstance.payouts.create({

    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, 

    fund_account_id: fundAccountId,

    amount: amountForPayoutInPaise, 

    currency: "INR",

    mode: 'UPI',

    purpose: 'payout',

    notes: {

    paymentFor: `Service: ${paymentRecord.serviceRequest?.title || 'N/A'}`,

    serviceRequestId: paymentRecord.serviceRequest?._id.toString() || 'N/A',

    platformFee: (paymentRecord.platformFeeAmount / 100).toFixed(2), 

    repairerUpiId: paymentRecord.repairer.upiId

    },

    queue_if_scanned: true 

    });



    console.log('DEBUG: Payout API Response:', JSON.stringify(payout, null, 2));



    paymentRecord.razorpayTransferId = payout.id;

    paymentRecord.status = 'payout_initiated';

    paymentRecord.payoutDetails = {

    upiId: paymentRecord.repairer.upiId,

    transferTimestamp: new Date(),

    razorpayPayoutId: payout.id, 

    razorpayPayoutStatus: payout.status 

    };

    await paymentRecord.save();

    console.log('DEBUG: Payout initiated to Repairer. Payout ID:', payout.id, 'Status:', payout.status);



    const serviceRequest = await ServiceRequest.findById(paymentRecord.serviceRequest._id);

    if (serviceRequest && (serviceRequest.status === 'quoted' || serviceRequest.status === 'pending_payment')) {

    serviceRequest.status = 'in_progress';

    await serviceRequest.save();

    console.log(`DEBUG: Service Request ${serviceRequest._id} status updated to 'in_progress' (payout initiated).`);

    }

    console.log('-------------------------------------------\n');



    return res.status(200).json({

    success: true,

    message: "Payment verified and payout initiated successfully!",

    paymentRecord: paymentRecord,

    serviceRequestStatus: serviceRequest?.status,

    payoutStatus: payout.status

    });



    } catch (transferError) {

    console.error("Error initiating Razorpay Payout (SDK transferError):", transferError.error?.description || transferError.message || transferError);

    paymentRecord.status = 'payout_failed_transfer_issue';

    await paymentRecord.save();

    return res.status(500).json({ success: false, message: transferError.error?.description || "Payment verified, but failed to initiate payout. Please contact support immediately." });

    }

    } else {

    console.log('DEBUG: No payout initiated: Repairer or UPI ID missing, or payout amount is zero.');

    const serviceRequest = await ServiceRequest.findById(paymentRecord.serviceRequest._id);

    if (serviceRequest && (serviceRequest.status === 'quoted' || serviceRequest.status === 'pending_payment')) {

    serviceRequest.status = 'in_progress'; 
    await serviceRequest.save();

    console.log(`DEBUG: Service Request ${serviceRequest._id} status updated to 'in_progress' (no payout needed/possible).`);

    }

    if (paymentRecord.status === 'pending') {

    paymentRecord.status = 'completed';

    }

    await paymentRecord.save();

    return res.status(200).json({

    success: true,

    message: "Payment verified successfully. No payout needed or possible at this time.",

    paymentRecord: paymentRecord,

    serviceRequestStatus: serviceRequest?.status

    });

    }



    } catch (error) {

    console.error("Error in verifyAndTransferPayment (outer catch):", error);

    res.status(500).json({ success: false, message: "Failed to verify payment due to an unexpected error." });

    }

};


export const getServiceRequestById = async (req, res) => {
    const userId = req.user?._id;
    const { id } = req.params; 

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }
    if (!id) {
        return res.status(400).json({ message: "Service Request ID is required." });
    }

    try {
        const serviceRequest = await ServiceRequest.findOne({ _id: id, customer: userId })
                                                    .populate('repairer', 'fullname businessName'); 

        if (!serviceRequest) {
            return res.status(404).json({ message: "Service Request not found or not authorized." });
        }

        res.status(200).json(serviceRequest);
    } catch (error) {
        console.error("Error fetching single service request:", error);
        res.status(500).json({ message: "Failed to fetch service request details." });
    }
};

export const getPaymentDetailsById = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user._id;

        console.log(`[getPaymentDetailsById] Fetching payment ${paymentId} for user ${userId}`);

        const payment = await Payment.findOne({ _id: paymentId, customer: userId })
                                     .populate('serviceRequest'); 

        console.log(`[getPaymentDetailsById] Query result for payment ${paymentId}:`, payment);
        if (payment && payment.serviceRequest) {
            console.log(`[getPaymentDetailsById] Payment ${paymentId} has serviceRequest populated:`, payment.serviceRequest._id || payment.serviceRequest);
        } else {
            console.warn(`[getPaymentDetailsById] Payment ${paymentId} does NOT have serviceRequest populated or linked.`);
        }


        if (!payment) {
            console.warn(`[getPaymentDetailsById] Payment ${paymentId} not found or not authorized for user ${userId}.`);
            return res.status(404).json({ success: false, message: "Payment record not found or not authorized." });
        }

        res.status(200).json({ success: true, data: payment });

    } catch (error) {
        console.error('[getPaymentDetailsById] Error fetching payment details:', error);
        console.error('[getPaymentDetailsById] Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ success: false, message: 'Server error: Failed to fetch payment details.' });
    }
};




export const serviceOtp = async (req,res)=>{
    const { requestId, otp } = req.body;
    const serviceId = requestId

    if (!requestId || !otp) return res.status(400).json({ message: " OTP is required" });
    try {
        const record = await AcceptOtp.findOne({ serviceId });
       
        if (!record) return res.status(400).json({ message: "No OTP found for this service" });
        if (record.otp != otp) return res.status(400).json({ message: "Invalid verification code." });
        if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired. Please request a new one." });
        
        await AcceptOtp.deleteOne({ serviceId });
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "OTP verification failed" });
    }
}

export const submitServiceReview = async (req, res) => {
    const { serviceRequestId } = req.params; 
    const { stars, comment } = req.body;     
    const customerId = req.user?._id;      
    if (!customerId) {
        return res.status(401).json({ success: false, message: "Unauthorized: User not logged in." });
    }

    if (!serviceRequestId || !stars || stars < 1 || stars > 5) {
        return res.status(400).json({ success: false, message: "Service Request ID and valid stars (1-5) are required." });
    }

    try {
        const serviceRequest = await ServiceRequest.findById(serviceRequestId);

        if (!serviceRequest) {
            return res.status(404).json({ success: false, message: "Service Request not found." });
        }
        if (serviceRequest.customer.toString() !== customerId.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to review this service." });
        }
        if (serviceRequest.rating && serviceRequest.rating.stars) {
            return res.status(409).json({ success: false, message: "This service has already been reviewed." });
        }
        serviceRequest.rating = {
            stars: parseInt(stars), // Ensure it's an integer
            comment: comment ? String(comment).trim() : undefined, // Optional comment
        };
        await serviceRequest.save();

        res.status(200).json({ success: true, message: "Review submitted successfully!", serviceRequest });

    } catch (error) {
        console.error("Error submitting service review:", error);
        res.status(500).json({ success: false, message: "Failed to submit review due to an internal server error." });
    }
};

