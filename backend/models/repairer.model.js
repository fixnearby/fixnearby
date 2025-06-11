import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const repairerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, 
    },
    aadharcardNumber: {
      type: String,
      required: true,
      unique: true,
      minlength: 12,
      maxlength: 12,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      minlength: 10,
      maxlength: 10,
    },
    services: [
      {
        name: {
          type: String,
          required: true,
        },
        visitingCharge: {
          type: Number,
          default: 0,
        },
      },
    ],
    pincode: {
      type: String,
      required: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
   
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "No biography provided yet. Update your profile!"
    },
    experience: { // In years
      type: Number,
      min: 0,
      default: 0
    },
    profileImageUrl: {
      type: String,
      default: "https://res.cloudinary.com/dvfcp4eqz/image/upload/v1717325603/profile_pictures/user_wqx0pr.png" // Default placeholder image
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: false
      },
      serviceRadius: {
        type: Number,
        default: 25,
        min: 5,
        max: 200
      }
    }
  },
  { timestamps: true }
);


repairerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const Repairer = mongoose.model("Repairer", repairerSchema);

export default Repairer;