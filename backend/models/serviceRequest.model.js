const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const ServiceRequestSchema = new Schema({
  customer: {
    type: Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  repairer: {
    type: Types.ObjectId,
    ref: 'Repairer',
    required: false // optional at request creation
  },
  serviceType: {
    type: String,
    enum: [
      'electronics', 'appliances', 'plumbing', 'electrical',
      'carpentry', 'painting', 'automotive', 'hvac', 'other'
    ],
    required: true
  },
  preferredTimeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    default: 'morning'
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ServiceRequest = model('ServiceRequest', ServiceRequestSchema);

export default ServiceRequest;
