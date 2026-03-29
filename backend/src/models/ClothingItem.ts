import mongoose, { Document, Schema } from 'mongoose';

export interface IClothingItem extends Document {
  userId: string;
  imageUrl: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';
  colors: string[];
  material: string;
  style: string[];
  seasons: string[];
  occasions: string[];
  note: string;
  wearCount: number;
  lastWornAt: Date | null;
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
    colors: { type: [String], default: [] },
    material: { type: String, default: '' },
    style: { type: [String], default: [] },
    seasons: { type: [String], default: [] },
    occasions: { type: [String], default: [] },
    note: { type: String, default: '' },
    wearCount: { type: Number, default: 0 },
    lastWornAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IClothingItem>('ClothingItem', ClothingItemSchema);
