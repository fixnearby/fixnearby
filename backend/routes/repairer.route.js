import express from "express";
import {
  getOtp,
  verifyOtp,
  signup,
  login,
  logout,
  getDashboardStats,
  getRecentActivity,
  getNearbyJobs,
  acceptJob,
  getRepairerProfile, // New
  updateRepairerProfile, // New
  updateRepairerSettings, // New
  getRepairerAnalytics, // New
  getRepairerConversations, // New
  getConversationMessages, // New
  sendMessage, // New
  getRepairerNotifications, // New
  markNotificationAsRead, // New
} from "../controllers/repairer.controller.js";
import { repairerProtectRoute } from "../middleware/middleware.js";

const router = express.Router();

// Auth Routes
router.post("/getotp", getOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Dashboard Routes (Protected)
router.get("/dashboard-stats", repairerProtectRoute, getDashboardStats);
router.get("/recent-activity", repairerProtectRoute, getRecentActivity);
router.get("/jobs/nearby", repairerProtectRoute, getNearbyJobs);
router.post("/jobs/:jobId/accept", repairerProtectRoute, acceptJob);

// Profile Routes (Protected)
router.get("/profile", repairerProtectRoute, getRepairerProfile);
router.put("/profile", repairerProtectRoute, updateRepairerProfile); 

// Settings Routes (Protected)
router.put("/settings", repairerProtectRoute, updateRepairerSettings);

// Analytics Routes (Protected)
router.get("/analytics", repairerProtectRoute, getRepairerAnalytics);

// Messaging/Conversation Routes (Protected)
router.get("/conversations", repairerProtectRoute, getRepairerConversations); 
router.get("/conversations/:serviceId/messages", repairerProtectRoute, getConversationMessages);
router.post("/messages/send", repairerProtectRoute, sendMessage); 

// Notifications Routes (Protected)
router.get("/notifications", repairerProtectRoute, getRepairerNotifications);
router.put("/notifications/:notificationId/read", repairerProtectRoute, markNotificationAsRead);


export default router;