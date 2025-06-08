import express from "express";
import { login, logout, signup , getOtp , verifyOtp } from "../controllers/repairer.controller.js";
import { repairerProtectRoute } from "../middleware/middleware.js";
const router = express.Router();


// -> /api/repairer/get_otp
router.post("/getotp",getOtp);

// -> /api/repairer/verify_otp
router.post("/verify-otp",verifyOtp);

// -> /api/repairer/signup
router.post("/signup", signup);

// -> /api/repairer/login
router.post("/login", login);

// -> /api/repairer/logout
router.post("/logout", logout);

// -> /api/repairer/check



export default router;