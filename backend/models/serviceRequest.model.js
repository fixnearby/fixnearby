import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    repairer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repairer",
      default: null,
    },
    title: {
      type: String, 
    },
    serviceType: {
      type: String,
      required: true,
      enum: ["electrical", "plumbing", "carpentry", "appliance_repair", "hvac", "cleaning", "painting", "other"],
    },
    category: {
      type: String, 
      required: true,
    },
    issue: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    priceRange: {
      type: String, 
      default: "Negotiable",
    },
    estimatedPrice: {
      type: Number,
      default: 0,
    },
    quotation: {
      type: Number, 
    },
    location: {
      captureMethod: {
        type: String,
        enum: ["gps", "manual"],
        default: "manual",
      },
      address: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    preferredTimeSlot: {
      date: {
        type: Date,
      },
      time: {
        type: String, 
      },
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["requested", "pending_quote", "quoted", "accepted", "in_progress", "completed", "cancelled", "rejected"],
      default: "requested",
    },
    assignedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date, 
    },
    rating: {
      stars: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 500,
      },
    },
  },
  { timestamps: true }
);

serviceRequestSchema.pre("save", function (next) {
  if (this.isNew && !this.title && this.serviceType) {
    const formattedServiceType = this.serviceType.charAt(0).toUpperCase() + this.serviceType.slice(1).replace(/_/g, ' ');
    this.title = `${formattedServiceType} - ${this.category}`;
  }
  next();
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;