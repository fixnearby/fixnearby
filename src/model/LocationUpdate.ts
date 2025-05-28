import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILocationUpdate extends Document {
  serviceRequestId: Types.ObjectId;
  providerId: Types.ObjectId;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  updatedAt: Date;
}

const LocationUpdateSchema = new Schema<ILocationUpdate>({
  serviceRequestId: { type: Schema.Types.ObjectId, required: true, ref: "ServiceRequest" },
  providerId: { type: Schema.Types.ObjectId, required: true, ref: "Provider" },
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }
  },
  updatedAt: { type: Date, default: Date.now }
});

LocationUpdateSchema.index({ location: "2dsphere" });

export const LocationUpdate = mongoose.models.LocationUpdate || mongoose.model<ILocationUpdate>("LocationUpdate", LocationUpdateSchema);