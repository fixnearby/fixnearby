// backend/controllers/serviceRequest.controller.js
import ServiceRequest from '../models/serviceRequest.model.js';
import User from '../models/user.model.js';     
import Repairer from '../models/repairer.model.js'; 


const formatLocationData = (location) => {
 if (!location) return null;
 return {
     fullAddress: location.fullAddress || '',
 pincode: location.pincode || '',
 city: location.city || '',
 state: location.state || '',
 coordinates: location.coordinates || [],
 captureMethod: location.captureMethod || '' 
  };
};

export const createServiceRequest = async (req, res) => {
  try {
    const {
      title,
      serviceType,
      description,
      locationData,
      preferredTimeSlot,
      urgency,
      budget,
      contactInfo,
      repairerId,
      issue,
      category,
      quotation
    } = req.body;

    const customerId = req.user._id;

    if (
      !title ||
      !serviceType ||
      !description ||
      !locationData ||
      !locationData.fullAddress ||
      !locationData.pincode ||
      !locationData.captureMethod ||
      !preferredTimeSlot ||
      !preferredTimeSlot.date ||
      !preferredTimeSlot.time ||
      !budget ||
      !contactInfo
    ) {
      return res.status(400).json({
        message: 'Please provide all required fields: title, service type, description, location details (address, postal code, capture method), preferred date and time, budget, and contact info.'
      });
    }

    const newServiceRequest = new ServiceRequest({
      customer: customerId,
      title: title,
      serviceType: serviceType,
      issue,
      category,
      quotation,
      description,
      location: {
        address: locationData.fullAddress,
        pincode: locationData.pincode,
        city: locationData.city,
        state: locationData.state,
        coordinates: locationData.coordinates,
        captureMethod: locationData.captureMethod
      },
      preferredTimeSlot: {
        date: preferredTimeSlot.date,
        time: preferredTimeSlot.time
      },
      urgency,
      budget: budget,
      contactInfo: contactInfo,
      repairer: repairerId || null,
      status: repairerId ? 'in_progress' : 'requested'
    });

    await newServiceRequest.save();
    res.status(201).json({ success: true, message: 'Service request created successfully!', data: newServiceRequest });

  } catch (error) {
    console.error('Error creating service request:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Internal server error during service request creation.' });
  }
};



// 2. Get service requests by location (Used by user to find repairers, and by repairer to find incoming/in-progress jobs)
export const getServiceRequestsByLocation = async (req, res) => {
    try {
        const { pincode, serviceType, latitude, longitude, radius, statusFilter } = req.query;

        const isRepairerAccess = req.repairer && req.repairer._id;
        let repairerServices = [];
        let repairerId = null;
        let query = {};

        if (isRepairerAccess) {
            // Fetch the current repairer's services and their actual postal code
            const currentRepairer = await Repairer.findById(req.repairer._id).select('location services');
            if (!currentRepairer) {
                return res.status(404).json({ message: "Repairer profile not found." });
            }
            // Override pincode with the repairer's actual registered postal code for their search
            req.query.pincode = currentRepairer.location?.postalCode;
            repairerServices = currentRepairer.services.map(s => s.name);
            repairerId = currentRepairer._id;
        }

        // Apply pincode filter
        if (req.query.pincode) {
            query['location.pincode'] = req.query.pincode;
        } else if (latitude && longitude && radius) {
            // Placeholder for actual geospatial search if implemented later
            return res.status(400).json({ message: 'GPS-based search for repairers not yet fully implemented for this endpoint.' });
        } else if (!isRepairerAccess) {
             // Only require pincode if it's a general user search (not repairer context)
             return res.status(400).json({ message: 'Postal code is required for service search.' });
        }

        // Filter by serviceType (if provided in query, or by repairer's offered services)
        if (serviceType) {
            query.serviceType = serviceType.toLowerCase();
        } else if (isRepairerAccess && repairerServices.length > 0) {
            query.serviceType = { $in: repairerServices.map(s => s.toLowerCase()) };
        }

        // Status filtering logic
        if (isRepairerAccess) {
            // For repairers:
            // - show 'requested' (unassigned) jobs in their area/service,
            // - and jobs 'in_progress' or 'completed' that are assigned to them.
            query.$or = [
                { status: 'requested', repairer: null },
                { status: 'in_progress', repairer: repairerId },
                { status: 'completed', repairer: repairerId }
            ];

            // If a specific statusFilter is provided by the repairer, prioritize it
            if (statusFilter) {
                const specificStatusQuery = [{ status: statusFilter, repairer: repairerId }];
                if (statusFilter === 'requested') {
                    specificStatusQuery.push({ status: 'requested', repairer: null });
                }
                query.$or = specificStatusQuery;
            }
        } else if (statusFilter) {
            // For general user queries (e.g., checking status of a specific job), apply statusFilter directly
            query.status = statusFilter;
        } else {
             // Default for user searching repairers (initial match): show only 'requested' status (jobs that can be accepted)
             query.status = 'requested';
        }

        const serviceRequests = await ServiceRequest.find(query)
            .populate('customer', 'fullname phone')
            .populate('repairer', 'fullname businessName phone'); // Populate repairer if assigned

        res.json({
            success: true,
            count: serviceRequests.length,
            data: serviceRequests.map(request => ({
                id: request._id, // Transform _id to id
                title: request.title,
                description: request.description,
                serviceType: request.serviceType,
                location: formatLocationData(request.location), // Use helper
                urgency: request.urgency,
                status: request.status,
                customer: request.customer,
                repairer: request.repairer,
                preferredTimeSlot: request.preferredTimeSlot,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching service requests by location:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during service request retrieval.'
        });
    }
};

// 3. Get all service requests for a specific user (Customer)
export const getUserServiceRequests = async (req, res) => {
    try {
        const customerId = req.user._id; // From userProtectRoute middleware
        const { statusFilter } = req.query; // Allow filtering by status (e.g., 'in_progress', 'completed')

        let query = { customer: customerId };

        if (statusFilter) {
            query.status = statusFilter;
        }

        const serviceRequests = await ServiceRequest.find(query)
            .populate('repairer', 'fullname phone businessName') // Populate assigned repairer details
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: serviceRequests.length,
            data: serviceRequests.map(request => ({
                id: request._id,
                title: request.title,
                description: request.description,
                serviceType: request.serviceType,
                location: formatLocationData(request.location),
                urgency: request.urgency,
                status: request.status,
                repairer: request.repairer, // Show assigned repairer
                preferredTimeSlot: request.preferredTimeSlot,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching service requests by customer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during service request retrieval for customer.'
        });
    }
};

// 4. Update service request status by Customer (e.g., cancel, confirm completed)
export const updateServiceRequestStatusByCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const customerId = req.user._id; // From userProtectRoute middleware

        if (!status) {
            return res.status(400).json({ message: 'Status is required.' });
        }

        const serviceRequest = await ServiceRequest.findOne({ _id: id, customer: customerId });

        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found or not owned by this user.' });
        }

        // Define allowed status transitions for the customer
        if (status === 'cancelled' && ['requested', 'in_progress'].includes(serviceRequest.status)) {
            serviceRequest.status = status;
            // Optionally, notify repairer if already assigned
        } else if (status === 'completed' && serviceRequest.status === 'in_progress') {
            serviceRequest.status = status;
            // Optionally, trigger a review/rating prompt for the user
        } else {
            return res.status(400).json({ message: `Invalid status transition from '${serviceRequest.status}' to '${status}' for customer.` });
        }

        await serviceRequest.save();
        res.status(200).json({ success: true, message: `Service request status updated to ${status}.` });

    } catch (error) {
        console.error('Error updating service request status by customer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during service request status update by customer.'
        });
    }
};

// 5. Update service request status by Repairer (e.g., accept, mark as completed)
export const updateServiceRequestStatusByRepairer = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const repairerId = req.repairer._id; // From repairerProtectRoute middleware

        if (!status) {
            return res.status(400).json({ message: 'Status is required.' });
        }

        const serviceRequest = await ServiceRequest.findById(id);

        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found.' });
        }

        // Authorization and allowed status transitions for repairer
        // 1. Repairer accepts a 'requested' job (assigns themselves)
        if (status === 'in_progress' && serviceRequest.status === 'requested' && serviceRequest.repairer === null) {
            serviceRequest.status = status;
            serviceRequest.repairer = repairerId; // Assign the repairer to the request
        }
        // 2. Repairer marks their assigned 'in_progress' job as 'completed'
        else if (status === 'completed' && serviceRequest.status === 'in_progress' && serviceRequest.repairer.toString() === repairerId.toString()) {
            serviceRequest.status = status;
        }
        // 3. Prevent other invalid transitions or unauthorized access
        else {
            // If the job is already assigned to someone else, or status transition is invalid
            if (serviceRequest.repairer && serviceRequest.repairer.toString() !== repairerId.toString()) {
                return res.status(403).json({ message: 'You are not authorized to update this service request (it is assigned to another repairer).' });
            }
            return res.status(400).json({ message: `Invalid status transition from '${serviceRequest.status}' to '${status}' for repairer.` });
        }

        await serviceRequest.save();
        res.status(200).json({ success: true, message: `Service request status updated to ${status}.` });

    } catch (error) {
        console.error('Error updating service request status by repairer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during service request status update by repairer.'
        });
    }
};

// 6. Get a single service request by ID (for detail view by either customer or assigned repairer)
export const getServiceRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceRequest = await ServiceRequest.findById(id)
            .populate('customer', 'fullname phone')
            .populate('repairer', 'fullname phone businessName'); // Populate both for detail view

        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found.' });
        }

        // Authorization check: Only the owning customer or the assigned repairer can view
        const isUserAuthorized = req.user && serviceRequest.customer && req.user._id.toString() === serviceRequest.customer.toString();
        const isRepairerAuthorized = req.repairer && serviceRequest.repairer && req.repairer._id.toString() === serviceRequest.repairer.toString();

        if (!isUserAuthorized && !isRepairerAuthorized) {
            return res.status(403).json({ message: 'You are not authorized to view this service request.' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: serviceRequest._id,
                title: serviceRequest.title,
                description: serviceRequest.description,
                serviceType: serviceRequest.serviceType,
                location: formatLocationData(serviceRequest.location),
                urgency: serviceRequest.urgency,
                status: serviceRequest.status,
                customer: serviceRequest.customer,
                repairer: serviceRequest.repairer,
                preferredTimeSlot: serviceRequest.preferredTimeSlot,
                createdAt: serviceRequest.createdAt,
                updatedAt: serviceRequest.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching service request by ID:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};