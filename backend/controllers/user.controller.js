// backend/controllers/user.controller.js
import User from "../models/user.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";
import Otp from "../models/otp.model.js";
import { send_email } from "./sendemail.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../libs/utils.js";
import Repairer from "../models/repairer.model.js";
import ServiceRequest from "../models/serviceRequest.model.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const getOtp = async (req, res) => {
  const { email } = req.body;
  console.log("Received email for OTP:", email);
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });

  if (user) return res.status(400).json({ message: "User already exists" });

  const otp_generated = generateOTP();

  try {
    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp:otp_generated,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      },
      { upsert: true, new: true }
    );
    
    const is_email_sent = await send_email(email,otp_generated);
    console.log("Email sent status:", is_email_sent);
    if(!is_email_sent) {
      return res.status(500).json({ message: "Failed to send OTP" });
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
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });

    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "OTP verified successfully" , email : email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const signup = async (req,res)=>{
  // NOTE: If you truly do not want location here, remove address and postalCode from signup
  // For now, keeping it as it was in your previous signup logic for repairers.
  // If user signup should NOT collect location, remove these fields from frontend signup form and here.
  const { fullname , email , password , aadharCardNumber , phone , address , postalCode } = req.body;
  try {
    if (!fullname || !email || !password || !aadharCardNumber || !phone) { // Removed location from mandatory signup fields here
      return res.status(400).json({ message: "All required fields are needed for signup." });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      aadharCardNumber,
      phone,
      // If location is *never* stored in User model, remove this part entirely
      // location: { // Keeping this commented out as per your explicit request not to store in User model
      //   address,
      //   postalCode
      // }
    });

    if (newUser) {
      generateToken(newUser._id, "user", res); 
      await newUser.save(); 

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email, 
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
      console.error("Error in User signup controller:", error.message); 
      res.status(500).json({ message: "Internal Server Error during signup." });
  }
}

export const login = async(req,res)=>{
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");;

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, "user", res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in user login controller:", error.message); 
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const logout = async(req,res)=>{
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(400).json({ message: "No token found in cookies" });
    }

    await BlacklistToken.create({ token });

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
};

// MODIFIED: getRepairer to accept postalCode from query params
export const getRepairer = async (req, res) => {
  try {
    // Get postalCode from query parameters
    const { postalCode } = req.query; 

    if (!postalCode) {
      return res.status(400).json({ 
        message: 'Postal code is required to find nearby repairers.' 
      });
    }
    
    // Find repairers by the provided postal code
    const repairers = await Repairer.find({ 
      'location.postalCode': postalCode, // Assuming Repairer model *does* store location
      isAvailable: true 
    }).select('-password');
    
    res.status(200).json(repairers);
  } catch (error) {
    console.error("Error fetching repairers:", error.message); 
    res.status(500).json({ message: 'Error fetching repairers' });
  }
};


