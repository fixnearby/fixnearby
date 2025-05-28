import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  serviceRequestId: Types.ObjectId;
  razorpayPaymentId: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  serviceRequestId: { type: Schema.Types.ObjectId, required: true, ref: "ServiceRequest" },
  razorpayPaymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);