//backend/models/repairer.model.js
import mongoose from "mongoose";

const repairerSchema = new mongoose.Schema(
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
    aadharcardNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    services: [
      {
        name: {
          type: String,
          required: true
        },
        visitingCharge: {
          type: Number,
          min: 0,
          max:500,
          required: true
        }
      }
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    redFlag: {
      type: Number,
      default: 3,
      min: 0,
  
    },
    yellowFlag: {
      type: Number,
      default: 10,
      min: 0,
  
    },
    pincode:{
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid postal code']
    },
    role: {
      type: String,
      default: 'repairer'
    },
    
  },
  { timestamps: true }
);

const Repairer = mongoose.model("Repairer", repairerSchema);

export default Repairer;
