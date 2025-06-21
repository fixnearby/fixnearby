//backend/models/admin.model.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      default: 'admin'
    },

}
)

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;