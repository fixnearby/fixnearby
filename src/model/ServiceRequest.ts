import mongoose, { Schema, Document, Types } from "mongoose";

export interface IServiceRequest extends Document {
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  serviceType: string;
  price: number;
  status: "pending" | "accepted" | "on_the_way" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  providerId: { type: Schema.Types.ObjectId, required: true, ref: "Provider" },
  serviceType: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["pending", "accepted", "on_the_way", "completed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ServiceRequestModel = mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);