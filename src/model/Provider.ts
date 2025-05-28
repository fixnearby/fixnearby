import mongoose, { Schema, Document } from "mongoose";

export interface IProvider extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  services: string[];
  pricePerService: Record<string, number>;
  rating: {
    avg: number;
    totalRatings: number;
  };
  address: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  services: [{ type: String, required: true }],
  pricePerService: { type: Schema.Types.Mixed, required: true },
  rating: {
    avg: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  address: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ProviderModel = mongoose.models.Provider || mongoose.model<IProvider>("Provider", ProviderSchema);