// backend/routes/user.route.js
import express from "express";
import { 
    login, 
    logout, 
    signup, 
    getOtp, 
    verifyOtp, 
    getRepairer
    
} from "../controllers/user.controller.js"; 
import { userProtectRoute } from "../middleware/middleware.js";

const router = express.Router();

// -> /api/user/get_otp
router.post("/getotp", getOtp);

// -> /api/user/verify_otp
router.post("/verify-otp", verifyOtp);

// -> /api/user/signup
router.post("/signup", signup);

// -> /api/user/login
router.post("/login", login);

// -> /api/user/logout
router.post("/logout", logout);

// -> /api/user/dashboard?postalCode=123456
router.get("/dashboard", userProtectRoute, getRepairer);


export default router;
