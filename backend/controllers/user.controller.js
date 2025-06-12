// backend/controllers/user.controller.js
import User from "../models/user.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";
import Otp from "../models/otp.model.js";
import {
  send_email
} from "./sendemail.js";
import bcrypt from "bcryptjs";
import {
  generateToken
} from "../libs/utils.js";
import ServiceRequest from "../models/serviceRequest.model.js";
import Notification from "../models/notification.model.js";
import Conversation from "../models/conversation.model.js"; 
import Message from "../models/message.model.js";     
import Repairer from "../models/repairer.model.js"; 


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const getOtp = async (req, res) => { 
  const {
    email
  } = req.body;
  if (!email) return res.status(400).json({
    message: "Email is required"
  });
  const user = await User.findOne({
    email
  });
  if (user) return res.status(400).json({
    message: "User with this email already exists"
  });
  const otp_generated = generateOTP();
  try {
    await Otp.findOneAndUpdate({
      email
    }, {
      email,
      otp: otp_generated,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    }, {
      upsert: true,
      new: true
    });
    const is_email_sent = await send_email(email, otp_generated);
    if (!is_email_sent) {
      return res.status(500).json({
        message: "Failed to send OTP email"
      });
    }
    return res.status(200).json({
      message: "OTP sent to email"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};

export const verifyOtp = async (req, res) => { /* ... */
  const {
    email,
    otp
  } = req.body;
  if (!email || !otp) return res.status(400).json({
    message: "Email and OTP are required"
  });
  try {
    const record = await Otp.findOne({
      email
    });
    if (!record) return res.status(400).json({
      message: "No OTP found for this email"
    });
    if (record.otp !== otp) return res.status(400).json({
      message: "Invalid verification code."
    });
    if (record.expiresAt < new Date()) return res.status(400).json({
      message: "OTP expired. Please request a new one."
    });
    await Otp.deleteOne({
      email
    });
    return res.status(200).json({
      message: "OTP verified successfully"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "OTP verification failed"
    });
  }
};

export const signup = async (req, res) => { /* ... */
  const {
    fullname,
    email,
    password
  } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "All required fields must be filled"
      });
    }
    const existingUser = await User.findOne({
      email
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists"
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      message: "User account created successfully!",
    });
  } catch (error) {
    console.error("Error in signupUser controller:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        message: `Validation Error: ${messages.join(', ')}`
      });
    }
    res.status(500).json({
      message: "Internal Server Error during signup. Please try again."
    });
  }
};

export const login = async (req, res) => { /* ... */
  const {
    email,
    password
  } = req.body;
  try {
    const user = await User.findOne({
      email
    }).select("+password");
    if (!user) return res.status(400).json({
      message: "Invalid credentials"
    });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({
      message: "Invalid credentials"
    });
    generateToken(user._id, "user", res);
    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: "user",
    });
  } catch (error) {
    console.error("Error in login controller", error.message);
    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export const logout = async (req, res) => { /* ... */
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(400).json({
      message: "No token found in cookies"
    });
    await BlacklistToken.create({
      token
    });
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
    });
    res.status(200).json({
      message: "Logout successful"
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      message: "Server error during logout"
    });
  }
};

export const getDashboardStats = async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized: User ID not found."
    });
  }

  try {
    const totalServices = await ServiceRequest.countDocuments({
      customer: userId
    });
    const completedServices = await ServiceRequest.countDocuments({
      customer: userId,
      status: 'completed'
    });
    const inProgressServices = await ServiceRequest.countDocuments({
      customer: userId,
      status: {
        $in: ['accepted', 'in_progress', 'quoted', 'pending_quote']
      }
    });

    res.status(200).json({
      totalServices,
      completedServices,
      inProgressServices,
    });
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats."
    });
  }
};

export const getRecentActivity = async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized: User ID not found."
    });
  }

  try {
    const recentServiceRequests = await ServiceRequest.find({
        customer: userId
      })
      .sort({
        updatedAt: -1
      })
      .limit(5)
      .populate('repairer', 'fullname') // Populate repairer name
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
    res.status(500).json({
      message: "Failed to fetch recent activity."
    });
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
    prefferedDate,
    prefferedTime,
    quotation,
    estimatedPrice,
    attachments
  } = req.body;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized: User ID not found."
    });
  }

  if (!title || !description || !serviceType || !urgency || !location || !location.address || !location.pincode) {
    return res.status(400).json({
      message: "Missing required service request fields (title, description, serviceType, urgency, location)."
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
      prefferedDate: prefferedDate ? new Date(prefferedDate) : undefined,
      prefferedTime,
      quotation,
      estimatedPrice,
      attachments,
      status: 'requested',
    });

    await newServiceRequest.save();

    res.status(201).json({
      message: "Service request created successfully!",
      serviceRequest: newServiceRequest
    });
  } catch (error) {
    console.error("Error creating service request:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        message: `Validation Error: ${messages.join(', ')}`
      });
    }
    res.status(500).json({
      message: "Failed to create service request."
    });
  }
};

export const getInProgressServices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized: User ID not found."
    });
  }

  try {
    const inProgressServices = await ServiceRequest.find({
        customer: userId,
        status: {
          $in: ['accepted', 'in_progress', 'quoted']
        }
      })
      .populate('repairer', 'fullname email phone') 
      .sort({
        createdAt: -1
      })
      .lean();

    const formattedServices = inProgressServices.map(sr => ({
      _id: sr._id,
      title: sr.title,
      description: sr.description,
      serviceType: sr.serviceType,
      status: sr.status,
      urgency: sr.urgency,
      location: sr.location,
      prefferedDate: sr.prefferedDate ? sr.prefferedDate.toISOString().split('T')[0] : null,
      prefferedTime: sr.prefferedTime,
      quotation: sr.quotation,
      estimatedPrice: sr.estimatedPrice,
      assignedRepairer: sr.repairer ? {
        _id: sr.repairer._id,
        fullname: sr.repairer.fullname,
        email: sr.repairer.email,
        phone: sr.repairer.phone
      } : null,
      createdAt: sr.createdAt,
      updatedAt: sr.updatedAt,
    }));

    res.status(200).json(formattedServices);
  } catch (error) {
    console.error("Error fetching in-progress services:", error);
    res.status(500).json({
      message: "Failed to fetch in-progress services."
    });
  }
};

export const getPendingServices = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized: User ID not found."
    });
  }

  try {
    const pendingServices = await ServiceRequest.find({
        customer: userId,
        status: {
          $in: ['requested', 'pending_quote']
        }
      })
      .sort({
        createdAt: -1
      })
      .lean();

    const formattedServices = pendingServices.map(sr => ({
      _id: sr._id,
      title: sr.title,
      description: sr.description,
      serviceType: sr.serviceType,
      status: sr.status,
      urgency: sr.urgency,
      location: sr.location,
      prefferedDate: sr.prefferedDate ? sr.prefferedDate.toISOString().split('T')[0] : null,
      prefferedTime: sr.prefferedTime,
      quotation: sr.quotation,
      estimatedPrice: sr.estimatedPrice,
      createdAt: sr.createdAt,
      updatedAt: sr.updatedAt,
    }));

    res.status(200).json(formattedServices);
  } catch (error) {
    console.error("Error fetching pending services:", error);
    res.status(500).json({
      message: "Failed to fetch pending services."
    });
  }
};


export const cancelJob = async (req, res) => {
  const {
    jobId
  } = req.params;
  const userId = req.user?._id; // Ensure it's the requesting user's job

  if (!jobId || !userId) {
    return res.status(400).json({
      message: "Job ID and User ID are required."
    });
  }

  try {
    const serviceRequest = await ServiceRequest.findOne({
      _id: jobId,
      customer: userId
    });

    if (!serviceRequest) {
      return res.status(404).json({
        message: "Service Request not found or you are not authorized to cancel this job."
      });
    }

    // Only allow cancellation if status is 'requested', 'accepted', 'in_progress', or 'quoted'
    const cancellableStatuses = ['requested', 'accepted', 'in_progress', 'quoted', 'pending_quote'];
    if (!cancellableStatuses.includes(serviceRequest.status)) {
      return res.status(400).json({
        message: `Job cannot be cancelled in '${serviceRequest.status}' status.`
      });
    }

    serviceRequest.status = 'cancelled';
    serviceRequest.cancelledAt = new Date(); // Add a cancelledAt timestamp
    await serviceRequest.save();

    // Notify repairer if assigned
    if (serviceRequest.repairer) {
      await Notification.create({
        recipient: serviceRequest.repairer,
        recipientModel: 'Repairer',
        type: 'job_cancelled',
        message: `Service "${serviceRequest.title}" was cancelled by the customer.`,
        link: `/repairer/dashboard`, // Link to dashboard or specific job page
        relatedEntity: {
          id: jobId,
          model: 'ServiceRequest'
        }
      });
    }

    res.status(200).json({
      message: `Service Request ${jobId} cancelled successfully!`
    });
  } catch (error) {
    console.error("Error cancelling service request:", error);
    res.status(500).json({
      message: "Failed to cancel service request."
    });
  }
};


export const getUserConversations = async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized: User ID not found."
    });
  }

  try {
    const conversations = await Conversation.find({
        participants: userId
      })
      .populate({
        path: 'lastMessage',
        select: 'text createdAt senderId'
      })
      .populate({
        path: 'serviceRequest',
        select: 'title repairer status', // Populate serviceRequest for title and repairer
        populate: {
          path: 'repairer',
          select: 'fullname'
        } // Populate repairer's fullname
      })
      .sort({
        updatedAt: -1
      })
      .lean();

    const formattedConversations = conversations.map(conv => {
      const repairerParticipant = conv.serviceRequest?.repairer;
      const otherParticipantName = repairerParticipant?.fullname || `Repairer (ID: ${conv.serviceRequest?.repairer?._id?.toString().substring(0, 4)})`;
      const isChatActive = !['completed', 'cancelled', 'rejected'].includes(conv.serviceRequest?.status);

      return {
        id: conv._id.toString(),
        serviceId: conv.serviceRequest?._id.toString(),
        title: conv.serviceRequest?.title || 'Unknown Service Request',
        sender: otherParticipantName, 
        lastMessage: conv.lastMessage?.text || 'No messages yet.',
        time: conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }) : '',
        unread: false, 
        isActive: isChatActive 
      };
    });

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    res.status(500).json({
      message: "Failed to fetch conversations."
    });
  }
};


export const getConversationMessages = async (req, res) => {
  const {
    conversationId
  } = req.params;
  const userId = req.user?._id;

  if (!conversationId || !userId) {
    return res.status(400).json({
      message: "Conversation ID and User ID are required."
    });
  }

  try {
    const conversation = await Conversation.findById(conversationId).populate('serviceRequest', 'status'); 

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found."
      });
    }

    if (!conversation.participants.some(p => p.toString() === userId.toString())) { 
      return res.status(403).json({
        message: "You are not a participant in this conversation."
      });
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

    const messages = await Message.find({
        conversation: conversation._id
      })
      .sort({
        createdAt: 1
      })
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
      return { ...msg,
        senderName
      };
    }));

    res.status(200).json({
      conversationId: conversation._id,
      messages: populatedMessages,
      chatEnded: false 
    });

  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).json({
      message: "Failed to fetch messages for conversation."
    });
  }
};