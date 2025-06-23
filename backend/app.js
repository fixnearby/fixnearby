// backend/app.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import connectDB from "./db/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import compression from 'compression';
import userRoutes from "./routes/user.route.js";
import repairerRoutes from "./routes/repairer.route.js";
import adminRoutes from "./routes/admin.route.js";
import serviceRequestRoutes from "./routes/serviceRequest.route.js";
import { checkAuth } from "./libs/utils.js"; 

const app = express();
connectDB(); 

const allowedOrigins = [
  process.env.FRONTEND_URL, // https://www.fixnearby.in
  'https://fixnearby.in',   // non-www
  'https://fixnearby.vercel.app' // preview domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS: ' + origin));
    }
  },
  credentials: true, // Absolutely essential for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow common headers
}));

app.use(cookieParser());
app.use(morgan("dev")); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use(compression());

app.use("/api/user", userRoutes);
app.use("/api/repairer", repairerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/service-requests", serviceRequestRoutes);

app.get("/api/check-auth", checkAuth);

export default app;
