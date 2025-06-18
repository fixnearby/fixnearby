import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Repairer from "../models/repairer.model.js";
import Admin from "../models/admin.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";


export const generateToken = (userId, role, res) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // If you are deploying to Render (or Vercel), it will be HTTPS.
  // For cross-site cookies, SameSite=None and Secure=true are mandatory.
  // We'll use NODE_ENV to differentiate between local dev (http) and deployed (https).
  const isDeployed = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging" || process.env.NODE_ENV === "preview"; 
  // Add other NODE_ENV values if you use them for different deployed stages.
  // If NODE_ENV is not set or is 'development', it will be considered local.

  res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isDeployed ? "None" : "Lax", // "None" for deployed HTTPS, "Lax" for local HTTP
    secure: isDeployed,                    // true for deployed HTTPS, false for local HTTP
  });

  return token;
};


export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    console.log("Token received:", token);

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // check if the token is blacklisted or not
    const isBlacklisted = await BlacklistToken.findOne({token});
    if (isBlacklisted) {
      console.log("No token balckilisted");
      return res.status(401).json({ message: "Unauthorized - Token is Blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded.role);

    if (!decoded) {
      console.log("invalid token");
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    if (decoded.role === "user") {
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return res.status(401).json({ message: "User not found" });
      return res.json({ ...user.toObject(), role: "user" });
    }

    if (decoded.role === "repairer") {
      const repairer = await Repairer.findById(decoded.userId).select("-password");
      if (!repairer) return res.status(401).json({ message: "Repairer not found" });
      return res.json({ ...repairer.toObject(), role: "repairer" });
    }

    if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.userId).select("-password");
      if (!admin) return res.status(401).json({ message: "Admin not found" });
      return res.json({ ...admin.toObject(), role: "admin" });
    }

    return res.status(401).json({ message: "Invalid role" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
