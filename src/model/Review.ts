import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview extends Document {
  serviceRequestId: Types.ObjectId;
  providerId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  serviceRequestId: { type: Schema.Types.ObjectId, required: true, ref: "ServiceRequest" },
  providerId: { type: Schema.Types.ObjectId, required: true, ref: "Provider" },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);