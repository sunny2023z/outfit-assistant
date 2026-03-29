import mongoose, { Document, Schema } from 'mongoose';

export interface IClothingItem extends Document {
  userId: string;
  imageUrl: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';
  colors: string[];
  style: string[];
  seasons: string[];
  occasions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ClothingItemSchema = new Schema<IClothingItem>(
  {
    userId: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'],
    },
    colors: { type: [String], required: true, default: [] },
    style: { type: [String], default: [] },
    seasons: { type: [String], default: [] },
    occasions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IClothingItem>('ClothingItem', ClothingItemSchema);
