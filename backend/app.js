import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import connectDB from "./db/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.route.js";
import repairerRoutes from "./routes/repairer.route.js";
import adminRoutes from "./routes/admin.route.js";

const app = express();
connectDB()

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api/user",userRoutes);
app.use("/api/repairer",repairerRoutes);
app.use("/api/admin",adminRoutes);


export default app;