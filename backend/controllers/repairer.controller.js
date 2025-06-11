import Repairer from "../models/repairer.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";
import Otp from "../models/otp.model.js";
import { send_email } from "./sendemail.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../libs/utils.js";
import ServiceRequest from "../models/serviceRequest.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Authentication Controllers ---

export const getOtp = async (req, res) => {
  const { email } = req.body;
  console.log("Received email for OTP:", email);
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await Repairer.findOne({ email });

  if (user) return res.status(400).json({ message: "Repairer with this email already exists" });

  const otp_generated = generateOTP();

  try {
    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp: otp_generated,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
      },
      { upsert: true, new: true }
    );

    const is_email_sent = await send_email(email, otp_generated);
    console.log("Email sent status:", is_email_sent);
    if (!is_email_sent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  try {
    const record = await Otp.findOne({ email });

    if (!record) return res.status(400).json({ message: "No OTP found for this email" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid verification code." });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired. Please request a new one." });

    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const signup = async (req, res) => {
  console.log('Received signup data on backend:', req.body);
  const {
    fullname,
    email,
    password,
    aadharcardNumber,
    phone,
    services,
    pincode,
  } = req.body;

  try {
    if (!fullname || !email || !password || !aadharcardNumber || !phone || !services || !pincode) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const existingRepairer = await Repairer.findOne({ email });
    if (existingRepairer) {
      return res.status(400).json({ message: "Repairer with this email already exists" });
    }

    let serviceArray = [];
    if (Array.isArray(services)) {
        serviceArray = services;
    } else if (typeof services === 'string') {
        serviceArray = [{ name: services, visitingCharge: 0 }];
    } else {
        return res.status(400).json({ message: "Invalid services format" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newRepairer = new Repairer({
      fullname,
      email,
      password: hashedPassword,
      aadharcardNumber,
      phone,
      services: serviceArray,
      pincode,
    });

    await newRepairer.save();

    res.status(201).json({
      _id: newRepairer._id,
      fullname: newRepairer.fullname,
      email: newRepairer.email,
      services: newRepairer.services,
      message: "Repairer account created successfully!",
    });

  } catch (error) {
    console.error("Error in signupRepairer controller:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
    }
    res.status(500).json({ message: "Internal Server Error during signup. Please try again." });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const repairer = await Repairer.findOne({ email }).select("+password");

    if (!repairer) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, repairer.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(repairer._id, "repairer", res);

    res.status(200).json({
      _id: repairer._id,
      fullname: repairer.fullname,
      email: repairer.email,
      role: "repairer",
      preferences: repairer.preferences,
      pincode: repairer.pincode, 
      phone: repairer.phone, 
      bio: repairer.bio, 
      experience: repairer.experience, 
      services: repairer.services, 
      profileImageUrl: repairer.profileImageUrl, 
      rating: repairer.rating 
    });
  } catch (error) {
    console.error("Error in Repairer login controller", error.message);
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
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
};


export const getDashboardStats = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const jobsCompletedCount = await ServiceRequest.countDocuments({ repairer: repairerId, status: 'completed' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const earningsThisMonthResult = await ServiceRequest.aggregate([
      {
        $match: {
          repairer: repairerId,
          status: 'completed',
          completedAt: { $gte: startOfMonth },
          estimatedPrice: { $exists: true, $ne: null, $type: "number" }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$estimatedPrice" }
        }
      }
    ]);
    const earningsThisMonth = earningsThisMonthResult.length > 0 ? earningsThisMonthResult[0].totalEarnings : 0;

    const averageRatingResult = await ServiceRequest.aggregate([
      {
        $match: {
          repairer: repairerId,
          status: 'completed',
          "rating.stars": { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating.stars" }
        }
      }
    ]);
    const averageRating = averageRatingResult.length > 0 ? parseFloat(averageRatingResult[0].avgRating.toFixed(1)) : 0.0;

    // Active Jobs
    const activeJobsCount = await ServiceRequest.countDocuments({
      repairer: repairerId,
      status: { $in: ['in_progress', 'accepted', 'quoted', 'pending_quote'] }
    });
    const stats = {
      jobsCompleted: jobsCompletedCount,
      jobsCompletedChange: "N/A",
      earningsThisMonth: earningsThisMonth,
      earningsChange: "N/A",
      averageRating: averageRating,
      ratingChange: "N/A",
      activeJobs: activeJobsCount,
      activeJobsChange: "N/A"
    };
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats." });
  }
};


export const getRecentActivity = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const recentServiceRequests = await ServiceRequest.find({ repairer: repairerId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('customer', 'fullname')
      .lean();

    const activity = recentServiceRequests.map(sr => {
      let message = "";
      let type = "";
      let amount = null;

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
        message = `Completed ${sr.title} for ${sr.customer?.fullname || 'Unknown Customer'}`;
        amount = sr.estimatedPrice ? `$${sr.estimatedPrice}` : null;
      } else if (sr.status === 'in_progress' || sr.status === 'accepted' || sr.status === 'quoted') {
        type = "accepted";
        message = `Working on: ${sr.title} for ${sr.customer?.fullname || 'Unknown Customer'}`;
      } else if (sr.status === 'requested') {
        type = "new_request";
        message = `New request assigned: ${sr.title} from ${sr.customer?.fullname || 'Unknown Customer'}`;
      } else if (sr.status === 'cancelled') {
        type = "cancelled";
        message = `Job cancelled: ${sr.title} by ${sr.customer?.fullname || 'Unknown Customer'}`;
      }


      return { type, message, time: timeAgo, amount };
    });

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Failed to fetch recent activity." });
  }
};



export const getNearbyJobs = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const repairer = await Repairer.findById(repairerId);
    if (!repairer) {
      return res.status(404).json({ message: "Repairer not found." });
    }

    const repairerServices = repairer.services.map(s => s.name);
    const repairerPincode = repairer.pincode;
    const serviceRadius = repairer.preferences.serviceRadius || 25;

    console.log(repairerServices)

    const pincodePrefix = repairerPincode.toString().slice(0, 4);

    const nearbyServiceRequests = await ServiceRequest.find({
      status: 'requested',
      repairer: { $eq: null },
      serviceType: { $in: repairerServices },
      "location.pincode": { $regex: `^${pincodePrefix}` } // Match pincode starting with same 4 digits
    })
    .populate('customer', 'fullname')
    .sort({ createdAt: 1 })
    .limit(10)
    .lean();


    const formattedJobs = nearbyServiceRequests.map(sr => ({
      id: sr._id.toString(),
      title: sr.title,
      category: sr.serviceType,
      quotation: sr.quotation,
      issue:sr.issue,
      location: sr.location?.address || "Unknown Location",
      pincode: sr.location?.pincode,
      price: sr.estimatedPrice ? `$${sr.estimatedPrice}` : sr.priceRange || "Negotiable",
      urgency: sr.urgency || "medium",
      postedTime: sr.createdAt ? `${Math.floor((new Date() - sr.createdAt) / (1000 * 60))} mins ago` : "N/A",
      description: sr.description,
      customerName: sr.customer?.fullname || 'Unknown Customer',
      customerRating: sr.rating?.stars || 0.0,
      estimatedDuration: "Varies",
      icon: sr.serviceType === "plumbing" ? "Droplets" : sr.serviceType === "electrical" ? "Zap" : sr.serviceType === "carpentry" ? "Hammer" : "Wrench",
      color: sr.serviceType === "plumbing" ? "from-blue-400 to-cyan-500" : sr.serviceType === "electrical" ? "from-yellow-400 to-orange-500" : "from-gray-400 to-gray-500",
      tags: [],
    }));

    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("Error fetching nearby jobs:", error);
    res.status(500).json({ message: "Failed to fetch nearby jobs." });
  }
};


export const acceptJob = async (req, res) => {
  const { jobId } = req.params;
  const repairerId = req.repairer?._id;

  if (!jobId || !repairerId) {
    return res.status(400).json({ message: "Job ID and Repairer ID are required." });
  }

  try {
    const serviceRequest = await ServiceRequest.findById(jobId);

    if (!serviceRequest) {
      return res.status(404).json({ message: "Service Request not found." });
    }

    if (serviceRequest.status !== 'requested' || serviceRequest.repairer !== null) {
      return res.status(400).json({ message: "Service Request is not available for acceptance or already assigned." });
    }

    serviceRequest.repairer = repairerId;
    serviceRequest.status = 'accepted';
    serviceRequest.assignedAt = new Date();

    await serviceRequest.save();

    const conversation = await Conversation.findOneAndUpdate(
      { serviceRequest: jobId },
      {
        $addToSet: {
          participants: [repairerId, serviceRequest.customer],
          participantModels: ["Repairer", "User"]
        }
      },
      { upsert: true, new: true }
    );

    await Notification.create({
      recipient: serviceRequest.customer,
      recipientModel: 'User',
      type: 'job_accepted',
      message: `Your service request "${serviceRequest.title}" has been accepted by a repairer!`,
      link: `/user/jobs/${jobId}`,
      relatedEntity: { id: jobId, model: 'ServiceRequest' }
    });


    res.status(200).json({ message: `Service Request ${jobId} accepted successfully!`, serviceRequest });
  } catch (error) {
    console.error("Error accepting service request:", error);
    res.status(500).json({ message: "Failed to accept service request." });
  }
};
export const getRepairerProfile = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const repairer = await Repairer.findById(repairerId).select("-password");
    if (!repairer) {
      return res.status(404).json({ message: "Repairer not found." });
    }
    res.status(200).json(repairer);
  } catch (error) {
    console.error("Error fetching repairer profile:", error);
    res.status(500).json({ message: "Failed to fetch repairer profile." });
  }
};

export const updateRepairerProfile = async (req, res) => {
  const repairerId = req.repairer?._id;
  const { fullname, phone, bio, experience, profileImageUrl, services, pincode } = req.body; 

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const repairer = await Repairer.findById(repairerId);
    if (!repairer) {
      return res.status(404).json({ message: "Repairer not found." });
    }
    if (fullname !== undefined) repairer.fullname = fullname;
    if (phone !== undefined) repairer.phone = phone;
    if (bio !== undefined) repairer.bio = bio;
    if (experience !== undefined) repairer.experience = experience;
    if (profileImageUrl !== undefined) repairer.profileImageUrl = profileImageUrl;
    if (pincode !== undefined) repairer.pincode = pincode; 

    if (services && Array.isArray(services)) {
        const validServices = services.map(s => ({
            name: s.name,
            visitingCharge: typeof s.visitingCharge === 'number' ? s.visitingCharge : 0
        }));
        repairer.services = validServices;
    }

    await repairer.save(); 

    res.status(200).json({ message: "Profile updated successfully!", repairer });
  } catch (error) {
    console.error("Error updating repairer profile:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
    }
    res.status(500).json({ message: "Failed to update repairer profile." });
  }
};


export const updateRepairerSettings = async (req, res) => {
  const repairerId = req.repairer?._id;
  const { emailNotifications, smsNotifications, serviceRadius } = req.body;

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const repairer = await Repairer.findById(repairerId);
    if (!repairer) {
      return res.status(404).json({ message: "Repairer not found." });
    }

    if (repairer.preferences === undefined) {
      repairer.preferences = {}; 
    }
    if (emailNotifications !== undefined) repairer.preferences.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) repairer.preferences.smsNotifications = smsNotifications;
    if (serviceRadius !== undefined) repairer.preferences.serviceRadius = serviceRadius;

    await repairer.save();

    res.status(200).json({ message: "Settings updated successfully!", preferences: repairer.preferences });
  } catch (error) {
    console.error("Error updating repairer settings:", error);
    res.status(500).json({ message: "Failed to update repairer settings." });
  }
};
export const getRepairerAnalytics = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const jobsCompleted = await ServiceRequest.countDocuments({ repairer: repairerId, status: 'completed' });
    const totalEarningsResult = await ServiceRequest.aggregate([
      { $match: { repairer: repairerId, status: 'completed', estimatedPrice: { $exists: true, $ne: null, $type: "number" } } },
      { $group: { _id: null, total: { $sum: "$estimatedPrice" } } }
    ]);
    const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;
    const monthlyEarnings = [];
    const currentMonth = new Date();
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i + 1, 0);

      const earningsInMonthResult = await ServiceRequest.aggregate([
        {
          $match: {
            repairer: repairerId,
            status: 'completed',
            completedAt: { $gte: monthStart, $lte: monthEnd },
            estimatedPrice: { $exists: true, $ne: null, $type: "number" }
          }
        },
        { $group: { _id: null, total: { $sum: "$estimatedPrice" } } }
      ]);
      monthlyEarnings.unshift(earningsInMonthResult.length > 0 ? earningsInMonthResult[0].total : 0);
    }

    // Top Services (by number of completed jobs)
    const topServices = await ServiceRequest.aggregate([
      { $match: { repairer: repairerId, status: 'completed' } },
      { $group: { _id: "$serviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    res.status(200).json({
      jobsCompleted,
      totalEarnings,
      monthlyEarnings,
      topServices,
    });

  } catch (error) {
    console.error("Error fetching repairer analytics:", error);
    res.status(500).json({ message: "Failed to fetch repairer analytics." });
  }
};
export const getRepairerConversations = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const conversations = await Conversation.find({ participants: repairerId })
      .populate({
        path: 'lastMessage',
        select: 'text createdAt senderId'
      })
      .populate({
        path: 'serviceRequest',
        select: 'title customer status',
        populate: {
          path: 'customer',
          select: 'fullname'
        }
      })
      .sort({ updatedAt: -1 })
      .lean();

    const formattedConversations = conversations.map(conv => {
      const customerParticipant = conv.serviceRequest?.customer;
      const otherParticipantName = customerParticipant?.fullname || `Customer (ID: ${conv.serviceRequest?.customer?._id.toString().substring(0, 4)})`;

      return {
        id: conv._id.toString(),
        serviceId: conv.serviceRequest?._id.toString(),
        title: conv.serviceRequest?.title || 'Unknown Service Request',
        sender: otherParticipantName,
        lastMessage: conv.lastMessage?.text || 'No messages yet.',
        time: conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unread: false,
      };
    });

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Error fetching repairer conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations." });
  }
};

export const getConversationMessages = async (req, res) => {
  const { serviceId } = req.params;
  const repairerId = req.repairer?._id;

  if (!serviceId || !repairerId) {
    return res.status(400).json({ message: "Service ID and Repairer ID are required." });
  }

  try {
    const conversation = await Conversation.findOne({ serviceRequest: serviceId, participants: repairerId });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found or you are not a participant." });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    const populatedMessages = await Promise.all(messages.map(async (msg) => {
      let senderName = "Unknown";
      if (msg.senderModel === "Repairer") {
        const sender = await Repairer.findById(msg.senderId).select('fullname').lean();
        senderName = sender?.fullname || "Repairer";
      } else if (msg.senderModel === "User") {
        const sender = await User.findById(msg.senderId).select('fullname').lean();
        senderName = sender?.fullname || "Customer";
      }
      return { ...msg, senderName };
    }));

    res.status(200).json({
      conversationId: conversation._id,
      messages: populatedMessages
    });

  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).json({ message: "Failed to fetch messages for conversation." });
  }
};


export const sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  const senderId = req.repairer?._id;

  if (!conversationId || !text || !senderId) {
    return res.status(400).json({ message: "Conversation ID, message text, and sender ID are required." });
  }

  try {
    const conversation = await Conversation.findById(conversationId).populate('serviceRequest', 'title');

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ message: "You are not a participant in this conversation." });
    }

    const receiverId = conversation.participants.find(p => p.toString() !== senderId.toString());
    if (!receiverId) {
        return res.status(500).json({ message: "Could not determine receiver for this conversation." });
    }
    const receiverModelIndex = conversation.participants.findIndex(p => p.toString() === receiverId.toString());
    const receiverModel = conversation.participantModels[receiverModelIndex];
    if (!receiverModel) {
        return res.status(500).json({ message: "Could not determine receiver model for this conversation." });
    }

    const newMessage = new Message({
      conversation: conversation._id,
      serviceId: conversation.serviceRequest._id,
      senderId: senderId,
      senderModel: 'Repairer',
      receiverId: receiverId,
      receiverModel: receiverModel,
      text: text,
    });

    await newMessage.save();

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    await Notification.create({
      recipient: receiverId,
      recipientModel: receiverModel,
      type: 'new_message',
      message: `New message from ${req.repairer.fullname || 'A Repairer'} regarding service request "${conversation.serviceRequest.title || 'Unknown'}"`,
      link: `/messages/${conversation._id}`,
      relatedEntity: { id: newMessage._id, model: 'Message' }
    });

    res.status(201).json({ message: "Message sent successfully!", newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
};
export const getRepairerNotifications = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({ message: "Unauthorized: Repairer ID not found." });
  }

  try {
    const notifications = await Notification.find({ recipient: repairerId, recipientModel: 'Repairer' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching repairer notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const repairerId = req.repairer?._id;

  if (!notificationId || !repairerId) {
    return res.status(400).json({ message: "Notification ID and Repairer ID are required." });
  }

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: repairerId, recipientModel: 'Repairer' },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found or you are not the recipient." });
    }

    res.status(200).json({ message: "Notification marked as read.", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read." });
  }
};