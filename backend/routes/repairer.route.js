// backend/routes/repairer.route.js
import express from "express";
import { 
  login, 
  logout, 
  signup, 
  getOtp, 
  verifyOtp, 
  getDashboardStats, // Imported from controller
  getRecentActivity, // Imported from controller
  getNearbyJobs, // Imported from controller
  acceptJob // Imported from controller
} from "../controllers/repairer.controller.js"; // All controller functions now imported from this path

import { repairerProtectRoute } from "../middleware/middleware.js"; // Ensure this middleware exists

const router = express.Router();

// --- Authentication Routes ---
router.post("/getotp", getOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", repairerProtectRoute, logout); // Added protect middleware for logout

// --- Dashboard Data Routes (Protected) ---
// Use repairerProtectRoute middleware to ensure only authenticated repairers can access
router.get("/dashboard-stats", repairerProtectRoute, getDashboardStats); 
router.get("/recent-activity", repairerProtectRoute, getRecentActivity); 

// --- Job-related Routes (Protected) ---
router.get("/jobs/nearby", repairerProtectRoute, getNearbyJobs); // Route for nearby jobs
router.post("/jobs/:jobId/accept", repairerProtectRoute, acceptJob); // Route for accepting a job


export default router;
