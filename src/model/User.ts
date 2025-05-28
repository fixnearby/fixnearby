import mongoose, { Schema, Document } from "mongoose";

// Message subdocument (optional, customize as needed)
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// User interface
export interface User extends Document {
  name: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  pincode: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  verifyCode?: string;
  verifyCodeExpiry?: Date;
  isVerified?: boolean;
}

// User schema
const UserSchema: Schema<User> = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, "Invalid email format"] },
  password: { type: String, required: [true, "Password is required"] },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  messages: [MessageSchema],
  verifyCode: { type: String },
  verifyCodeExpiry: { type: Date },
  isVerified: { type: Boolean, default: false }
});

export const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);