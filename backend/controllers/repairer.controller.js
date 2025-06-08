import Repairer from "../models/repairer.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";
import Otp from "../models/otp.model.js";
import { send_email } from "./sendemail.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const getOtp = async (req, res) => {
  const { email } = req.body;
  console.log("Received email for OTP:", email);
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await Repairer.findOne({ email });
  
    if (user) return res.status(400).json({ message: "User already exists" });

  const otp_generated = generateOTP();

  try {
    // Upsert OTP (create or replace if exists)
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
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });

    // OTP valid - delete it
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const signup = async (req, res) => {
  const {
    fullname,
    email,
    password,
    aadharcardNumber,
    phone,
    services,
    experience,
  } = req.body;

  try {
    // Basic validation
    if (!fullname || !email || !password || !aadharcardNumber || !phone  || !services) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check if already exists
    const existingRepairer = await Repairer.findOne({ email });
    if (existingRepairer) {
      return res.status(400).json({ message: "Repairer already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new repairer
    const newRepairer = new Repairer({
      fullname,
      email,
      password: hashedPassword,
      aadharcardNumber,
      phone,
      services,
      experience,

    });

    await newRepairer.save();

    // Generate JWT and respond
    generateToken(newRepairer._id,newRepairer.role, res);

    res.status(201).json({
      _id: newRepairer._id,
      fullname: newRepairer.fullname,
      email: newRepairer.email,
      services: newRepairer.services,
      experience: newRepairer.experience,
    });

  } catch (error) {
    console.error("Error in signupRepairer controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const repairer = await Repairer.findOne({ email }).select("+password");

    if (!repairer) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, repairer.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(repairer._id,repairer.role, res);

    res.status(200).json({
      _id: repairer._id,
      fullname: repairer.fullname,
      email: repairer.email,
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

