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
    // SUN AB YE JO EMAIL AA RHA HAI USko AB FRONTEND PE HARDCODE KAR DENGE TAKI USER CHANGE NA KAR PAE
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const signup = async (req,res)=>{
  // ADDED: address and postalCode to destructuring
  const { fullname , email , password , aadharCardNumber , phone , address , postalCode } = req.body;
  try {
    // ADDED: validation for address and postalCode
    if (!fullname || !email || !password  || !aadharCardNumber || !phone || !address || !postalCode ) {
      return res.status(400).json({ message: "All fields (including location) are required" });
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
      // ADDED: location object
      location: {
        address,
        postalCode
      }
    });

    if (newUser) {
      // generate jwt token here
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



export const getRepairer = async (req, res) => {
  try {
    // Check if req.user and req.user.location are available from userProtectRoute
    // If location or postalCode is missing, it likely means the user registered before
    // the location fields were added to the User model/signup process, or profile was not updated.
    if (!req.user || !req.user.location || !req.user.location.postalCode) {
      console.warn("User location or postalCode missing for user:", req.user?._id, " - This might be an old user without updated profile data.");
      return res.status(400).json({ 
        message: 'Your profile location (address and postal code) is not set. Please update your profile to find nearby repairers.' 
      });
    }
    
    const userPostalCode = req.user.location.postalCode;
    const repairers = await Repairer.find({ 
      'location.postalCode': userPostalCode,
      isAvailable: true 
    }).select('-password');
    
    res.status(200).json(repairers);
  } catch (error) {
    console.error("Error fetching repairers:", error.message); 
    res.status(500).json({ message: 'Error fetching repairers' });
  }
};

export const createServiceRequest = async (req, res) => {
  try {
    // Destructure location from req.body as well
    const { repairerId, serviceType, description, location } = req.body; 
    
    // Determine the location to use for the service request
    // Prioritize location from req.body if provided, otherwise use user's stored location
    const serviceLocation = location || req.user?.location;

    // Validate required fields from req.body
    if (!serviceType || !description) {
      return res.status(400).json({ message: "Service type and description are required for a service request." });
    }

    // Validate if req.user and its ID are available from userProtectRoute
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    // Validate if serviceLocation is valid
    if (!serviceLocation || !serviceLocation.address || !serviceLocation.postalCode) {
      return res.status(400).json({ message: "Location (address and postal code) is required to create a service request." });
    }

    // Convert serviceType to a valid enum
    const validServiceType = serviceType.toLowerCase(); 
    const allowedServiceTypes = ['electronics', 'appliances', 'plumbing', 'electrical', 'carpentry', 'painting', 'automotive', 'hvac', 'other'];
    if (!allowedServiceTypes.includes(validServiceType)) {
      return res.status(400).json({ message: `Invalid service type: ${serviceType}. Allowed types are: ${allowedServiceTypes.join(', ')}` });
    }

    const newRequest = new ServiceRequest({
      customer: req.user._id,
      repairer: repairerId || null, 
      title: `${serviceType} service`, 
      description,
      serviceType: validServiceType, 
      location: { // Use the determined serviceLocation
        address: serviceLocation.address,
        postalCode: serviceLocation.postalCode
      },
      status: 'requested' 
    });
    
    await newRequest.save();
    res.status(201).json(newRequest); 
  } catch (error) {
    console.error("Error creating service request:", error.message); 
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
    }
    res.status(500).json({ message: 'Error creating service request. Please try again later.' });
  }
};

export const getServiceRequests = async (req, res) => {
  try {
    // Ensure req.user is available from userProtectRoute
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    const { status } = req.query;
    const query = { customer: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const requests = await ServiceRequest.find(query)
      .populate('repairer', 'fullname email phone'); 
    
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching service requests:", error.message); 
    res.status(500).json({ message: 'Error fetching service requests' });
  }
};
