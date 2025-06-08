//fixnearby3\backend\models\serviceRequest.model.js
import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repairer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repairer',
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  serviceType: {
    type: String,
    enum: [
      'electronics', 'appliances', 'plumbing', 'electrical',
      'carpentry', 'painting', 'automotive', 'hvac', 'other'
    ],
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    }
  },
  preferredTimeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'flexible'],
    default: 'flexible'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['requested',  'in_progress', 'completed', 'cancelled'], //with respect to user hai ye sab 
    default: 'requested'
  },
  assignedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  rating: {
    stars: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 300
    }
  }
}, {
  timestamps: true
});



serviceRequestSchema.index({ serviceType: 1, status: 1 });

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;