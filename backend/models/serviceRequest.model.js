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
    serviceType: {
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    issue: {
        type: String,
        required: true,
        trim: true,
    },
    priceRange:{
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true
    },
    quotation: {
        type: Number,
    },
    location: {
        captureMethod: {
            type: String,
            enum: ['gps', 'manual'],
            required: true
        },
        address: { type: String },
        pincode: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^\d{6}$/.test(v);
                },
                message: 'Pincode must be a 6-digit number'
            }
        },
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
        enum: ['requested', 'in_progress', 'completed', 'cancelled'],
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

serviceRequestSchema.pre('save', function(next) {
    if (this.isModified('location.fullAddress') && this.location.fullAddress && !this.location.address) {
        this.location.address = this.location.fullAddress;
    }
    if (this.isModified('location.pincode') && this.location.pincode && !this.location.postalCode) {
        this.location.postalCode = this.location.pincode;
    }

    if (!this.title && this.serviceType) {
        const formattedServiceType = this.serviceType.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        this.title = `${formattedServiceType} Service Request`;
    }
    next();
});

serviceRequestSchema.index({ serviceType: 1, status: 1 });
serviceRequestSchema.index({ 'location.pincode': 1, serviceType: 1 });
serviceRequestSchema.index({ customer: 1, status: 1 });
serviceRequestSchema.index({ repairer: 1, status: 1 });

serviceRequestSchema.methods.getFormattedLocation = function() {
    const location = this.location;
    let formatted = location.fullAddress;
    
    if (location.city || location.state || location.pincode) {
        const parts = [];
        if (location.city) parts.push(location.city);
        if (location.state) parts.push(location.state);
        if (location.pincode) parts.push(location.pincode);
        
        if (parts.length > 0) {
            formatted += ` (${parts.join(', ')})`;
        }
    }
    return formatted;
};

serviceRequestSchema.statics.findByPincode = function(pincode, serviceType = null) {
    const query = { 'location.pincode': pincode };
    if (serviceType) {
        query.serviceType = serviceType;
    }
    return this.find(query);
};

serviceRequestSchema.statics.findNearby = function(latitude, longitude, maxDistanceKm = 10) {
    const degreeDistance = maxDistanceKm / 111.32; 

    return this.find({
        'location.coordinates.latitude': { 
            $gte: latitude - degreeDistance, 
            $lte: latitude + degreeDistance 
        },
        'location.coordinates.longitude': { 
            $gte: longitude - degreeDistance, 
            $lte: longitude + degreeDistance 
        }
    });
};

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);

export default ServiceRequest;