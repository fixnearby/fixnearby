import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    aadharCardNumber:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    postalCode: { 
      type: String, 
      trim: true, 
      default: '' 
    },
    role: {
      type: String,
      default: 'customer'
    },
    isVerified: { // AADHAR CARD SE NAME AND PHONE NUMBER VERIFY HAI KI NAHI -> BUT BHENCHOD ISKI KOI API HI NAHI HAI MAINE DEKHA THA SEARCH KARKE
      type: Boolean, 
      default: false 
    },
    
},{ timestamps: true }
)

const User = mongoose.model("User", userSchema);

export default User;