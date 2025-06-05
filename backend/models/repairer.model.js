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
    aadharcardNumber:{
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
    postalCode: { type: String, trim: true, default: '' },

     services: [
    {
      name: {
        type: String,
        enum: [
          'electronics', 'appliances', 'plumbing', 'electrical',
          'carpentry', 'painting', 'automotive', 'hvac', 'other'
        ],
        required: true
      },
      price: {
        type: Number,
        min: 0,
        required: true
      }
    }
  ],
  experience: {
    type: Number,
    min: 0,
    max: 50
  },
  hourlyRate: { // ISKO HUM KAHA USE KARENGE PATA NAHI
    type: Number,
    min: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: { //KITNE LOGO NE RATE KIA HAI USKA COUNT HAI
      type: Number,
      default: 0
    }
  },
  isAvailable: { // YE REPAIRER APNI PROFILE PE SE JAKE SET KAR PAYEGA KI AVAILABLE HAI KI NAHI YE ISI SE SAB HANDLE HO JAEGA
    type: Boolean,
    default: true
  },
    isVerified: { // AADHAR CARD SE NAME AND PHONE NUMBER VERIFY HAI KI NAHI -> BUT BHENCHOD ISKI KOI API HI NAHI HAI MAINE DEKHA THA SEARCH KARKE
      type: Boolean, 
      default: false 
    },
    role: {
      type: String,
      default: 'repairer'
    },

},{ timestamps: true } //USER KAB AYA THA IS APP PE
)

const Repairer = mongoose.model("Repairer", repairerSchema);

export default Repairer;