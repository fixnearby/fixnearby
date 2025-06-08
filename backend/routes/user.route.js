import express from "express";
import { login, logout, signup , getOtp , verifyOtp  , getRepairer} from "../controllers/user.controller.js";
import { userProtectRoute } from "../middleware/middleware.js";
const router = express.Router();

// -> /api/user/get_otp
router.post("/getotp",getOtp);

// -> /api/user/verify_otp
router.post("/verify-otp",verifyOtp);

// -> /api/user/signup
router.post("/signup", signup);

// -> /api/user/login
router.post("/login", login);

// -> /api/user/logout
router.post("/logout", logout);

// -> /api/user/check


// -> /api/user/dashboard
router.get("/dashboard", userProtectRoute , getRepairer) // ye route se sare ACTIVE repairer ki list ayegi IN THAT AREA (AB WOH AREA KA LOGIC POSTAL CODE SE HOGA)
export default router;