import Admin from "../models/admin.model.js";
import { generateToken } from "../libs/utils.js";
import bcrypt from "bcryptjs";
import BlacklistToken from "../models/blacklistToken.model.js";
import ServiceRequest from "../models/serviceRequest.model.js";

export const signup = async (req,res)=>{
    const { fullname , phone , password , secretkey} = req.body;
    try {
        if(secretkey!=="jatinrandifixnearby"){
          return res.status(400).json({ message: "Secret Key is not valid" });
        }
        if (!fullname || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
        }

        const admin = await Admin.findOne({ phone });

        if (admin) return res.status(400).json({ message: "admin already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
        fullname,
        phone,
        password: hashedPassword,
        });

        if (newAdmin) {
        // generate jwt token here
        generateToken(newAdmin._id, newAdmin.role ,  res); //jwt token mai bus apan id jo mongo banata hai wahi save karenge
        await newAdmin.save(); 

        res.status(201).json({
            _id: newAdmin._id,
            fullname: newAdmin.fullname,
            phone: newAdmin.phone, // aur kuch res mai bhejna ho jo frontend pe dikhna ho woh add kar dena
        });
        } else {
        res.status(400).json({ message: "Invalid admin data" });
        }
    } catch (error) {
        console.log("Error in admin signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req, res) => {
  const { fullname,phone, password } = req.body;

  try {
    if (!fullname || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
        }
    const admin = await Admin.findOne({ phone }).select("+password");
    
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(admin._id,admin.role, res);

    res.status(200).json({
      _id: admin._id,
      phone: admin.phone,
      role: "admin"
    });

  } catch (error) {
    console.error("Error in admin login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(400).json({ message: "No token found in cookies" });
    }

    await BlacklistToken.create({ token });

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict"
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in admin logout controller:", error.message);
    res.status(500).json({ message: "Server error during logout" });
  }
};


export const getPaidServices  = async (req, res)=>{
   try {
      // Find all service requests with status 'customer_paid'
      const paidServices = await ServiceRequest.find({ 
        status: 'customer_paid' 
      })
      .populate('repairer', 'fullname phone upiId')
      .populate('customer', 'fullname phone')
      .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        message: 'Paid services fetched successfully',
        services: paidServices
      });
    } catch (error) {
      console.error('Error fetching paid services:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch paid services',
        error: error.message
      });
    }
}

export const completeService  = async (req, res)=>{
  try {
      const { serviceId } = req.params;

      // Find and update the service request
      const updatedService = await ServiceRequest.findByIdAndUpdate(
        serviceId,
        { 
          status: 'completed',
          completedAt: new Date()
        },
        { new: true }
      );

      if (!updatedService) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Service marked as complete successfully',
        service: updatedService
      });
    } catch (error) {
      console.error('Error completing service:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete service',
        error: error.message
      });
    }
}