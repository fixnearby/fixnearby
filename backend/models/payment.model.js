// backend/models/payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true,
       // unique: true 
    },
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
    amount: { 
        type: Number,
        required: true
    },
    platformFeePercentage: { 
        type: Number,
        default: 3, 
        min: 0,
        max: 100
    },
    platformFeeAmount: { 
        type: Number,
        default: 0
    },
    repairerPayoutAmount: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cash', 'other','rejection_fee', 'service_completion'],
        default: 'razorpay'
    },
    status: { 
        type: String,
        enum: ['created', 'pending', 'captured', 'failed', 'refunded', 'payout_initiated', 'payout_completed', 'payout_failed',     
            'payout_failed_contact_issue',  
            'payout_failed_fundaccount_issue', 
            'payout_failed_transfer_issue','completed' ]
    },
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true 
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    razorpayTransferId: { 
        type: String,
        default: null
    },
    payoutDetails: { 
        upiId: { type: String, trim: true },
        transferTimestamp: { type: Date }
    },
    paymentDate: { 
        type: Date,
        default: null
    }
}, { timestamps: true }); 

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
