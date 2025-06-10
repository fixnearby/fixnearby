// backend/controllers/repairer.controller.js
import Repairer from "../models/repairer.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";
import Otp from "../models/otp.model.js";
import { send_email } from "./sendemail.js"; // Assuming sendemail.js is also in controllers
import bcrypt from "bcryptjs";
import { generateToken } from "../libs/utils.js";
import ServiceRequest from "../models/serviceRequest.model.js"; // Correctly import your ServiceRequest model

// Helper function for OTP generation
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
    if (!fullname || !email || !password || !aadharcardNumber || !phone || !services || !pincode ) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const existingRepairer = await Repairer.findOne({ email });
    if (existingRepairer) {
      return res.status(400).json({ message: "Repairer with this email already exists" });
    }


    const serviceArray = [{ name: services, visitingCharge: 0 }]; 

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
      role: "repairer" 
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
    // Jobs Completed
    const jobsCompletedCount = await ServiceRequest.countDocuments({ repairer: repairerId, status: 'completed' });

    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const earningsThisMonthResult = await ServiceRequest.aggregate([
      {
        $match: {
          repairer: repairerId,
          status: 'completed',
          completedAt: { $gte: startOfMonth } 
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


    
    const activeJobsCount = await ServiceRequest.countDocuments({ 
        repairer: repairerId, 
        status: { $in: ['in_progress'] } 
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
    // Fetch recent service requests assigned to this repairer, sorted by update time
    const recentServiceRequests = await ServiceRequest.find({ repairer: repairerId })
                               .sort({ updatedAt: -1 }) // Sort by most recent update first
                               .limit(5) 
                               .lean(); 

    const activity = recentServiceRequests.map(sr => {
      let message = "";
      let type = "";
      let amount = null;
      // Calculate time difference in minutes, then format as "X mins/hours/days ago"
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
        message = `Completed ${sr.title} for customer (ID: ${sr.customer})`; 
        amount = sr.estimatedPrice ? `$${sr.estimatedPrice}` : null;
      } else if (sr.status === 'in_progress') {
        type = "accepted"; // Could be 'in_progress' for more specific activity
        message = `Working on: ${sr.title}`;
      } else if (sr.status === 'requested') {
         
        type = "new_request"; 
        message = `New request (assigned): ${sr.title}`;
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
       

        const nearbyServiceRequests = await ServiceRequest.find({
            status: 'requested', // Only jobs that are still open for assignment
            repairer: { $eq: null } // Explicitly looking for unassigned jobs
            // Add serviceType filtering if needed:
            // serviceType: { $in: repairerServiceTypes }
            // Add location-based filtering if your requests have coordinates
            // e.g., "location.coordinates": { $nearSphere: { $geometry: { type: "Point", coordinates: [long, lat] }, $maxDistance: 10000 } }
        }).limit(10).lean(); // Limit to 10 for the dashboard view

        
        const formattedJobs = nearbyServiceRequests.map(sr => ({
            id: sr._id.toString(), 
            title: sr.title,
            category: sr.serviceType, 
            location: sr.location?.address || "Unknown Location", 
            price: sr.estimatedPrice ? `$${sr.estimatedPrice}` : "Negotiable", 
            urgency: sr.urgency || "medium", 
            postedTime: sr.createdAt ? `${Math.floor((new Date() - sr.createdAt) / (1000 * 60))} mins ago` : "N/A", 
            description: sr.description,
            customerRating: sr.rating?.stars || 0.0, // Use rating.stars
            estimatedDuration: "Varies", // You might add this field to your model
            icon: sr.serviceType === "plumbing" ? "Droplets" : sr.serviceType === "electrical" ? "Zap" : "Wrench", // Map serviceType to Lucide icon string
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

        // Only allow acceptance if status is 'requested' and not already assigned
        if (serviceRequest.status !== 'requested' || serviceRequest.repairer !== null) { 
            return res.status(400).json({ message: "Service Request is not available for acceptance or already assigned." });
        }

        // Assign repairer and update status
        serviceRequest.repairer = repairerId;
        serviceRequest.status = 'in_progress'; // Change status to 'in_progress' once accepted
        serviceRequest.assignedAt = new Date(); // Record assignment time

        await serviceRequest.save();

        res.status(200).json({ message: `Service Request ${jobId} accepted successfully!`, serviceRequest });
    } catch (error) {
        console.error("Error accepting service request:", error);
        res.status(500).json({ message: "Failed to accept service request." });
    }
};
