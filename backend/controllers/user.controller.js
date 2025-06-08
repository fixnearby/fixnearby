import User from "../models/user.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";
import Otp from "../models/otp.model.js";
import { send_email } from "./sendemail.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../libs/utils.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//SAB VALIDATION LIKE EMAIL PASSWORD KAISA HAI KAISA NAHI SAB KUCH ZOD SE KARENGE SIDHA FRONTEND MAI YAHA PE VALIDATION MAT KARNA

export const getOtp = async (req, res) => {
  const { email } = req.body;
  console.log("Received email for OTP:", email);
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });

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

    // OTP valid - delete it
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "OTP verified successfully" , email : email });
    // SUN AB YE JO EMAIL AA RHA HAI USKO AB FRONTEND PE HARDCODE KAR DENGE TAKI USER CHANGE NA KAR PAE
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const signup = async (req,res)=>{
    const { fullname , email , password , aadharCardNumber , phone  } = req.body;
    try {
      if (!fullname || !email || !password  || !aadharCardNumber || !phone ) {
      return res.status(400).json({ message: "All fields are required" });
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
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, newUser.role , res); //jwt token mai bus apan id jo mongo banata hai wahi save karaenge
      await newUser.save(); 

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email, // aur kuch res mai bhejna ho jo frontend pe dikhna ho woh add kar dena
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
    } catch (error) {
      console.log("Error in User signup controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
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

    generateToken(user._id, user.role, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
    });
  } catch (error) {
    console.log("Error in user login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const logout = async(req,res)=>{
    try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(400).json({ message: "No token found in cookies" });
    }

    // Save the token to blacklist with expiry
    await BlacklistToken.create({ token });

    // Clear cookie
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



export const getRepairer = async(req,res)=>{

}