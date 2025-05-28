import mongoose, { Schema, Document, Types } from "mongoose";

interface IMessage {
  sender: "user" | "provider";
  text: string;
  timestamp: Date;
}

export interface IChat extends Document {
  serviceRequestId: Types.ObjectId;
  messages: IMessage[];
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, enum: ["user", "provider"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new Schema<IChat>({
  serviceRequestId: { type: Schema.Types.ObjectId, required: true, ref: "ServiceRequest" },
  messages: [MessageSchema]
});

export const ChatModel = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);