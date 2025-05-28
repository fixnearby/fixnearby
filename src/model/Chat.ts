import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for a message document
export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  text?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const messageSchema: Schema<IMessage> = new Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Create the model
export const MessageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);