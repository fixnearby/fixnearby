// backend/routes/serviceRequest.routes.js 
import express from "express";
import {
    createServiceRequest,
    getServiceRequestsByLocation,       
    getUserServiceRequests,             
    updateServiceRequestStatusByCustomer, 
    updateServiceRequestStatusByRepairer 
} from "../controllers/serviceRequest.controller.js";
import { userProtectRoute, repairerProtectRoute } from "../middleware/middleware.js"; 

const router = express.Router();

router.post("/", userProtectRoute, createServiceRequest);

router.get("/by-location", repairerProtectRoute, getServiceRequestsByLocation);


router.get("/user/my-requests", userProtectRoute, getUserServiceRequests); 

router.put("/user/:id/status", userProtectRoute, updateServiceRequestStatusByCustomer);

router.get("/repairer/my-requests", repairerProtectRoute, getServiceRequestsByLocation); 

router.put("/repairer/:id/status", repairerProtectRoute, updateServiceRequestStatusByRepairer);


export default router;