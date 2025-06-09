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
         /* enum: [
            'electronics', 'appliances', 'plumbing', 'electrical',
            'carpentry', 'painting', 'automotive', 'hvac', 'other'
          ],
          */
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
      type:Number,
      required: true
      /*min: 0,
      max: 50*/
    },
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
    isAvailable: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      default: 'repairer'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    }
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
repairerSchema.index({ location: '2dsphere' });

const Repairer = mongoose.model("Repairer", repairerSchema);

export default Repairer;
