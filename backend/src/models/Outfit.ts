import mongoose, { Document, Schema } from 'mongoose';

export interface IOutfit extends Document {
  userId: string;
  items: mongoose.Types.ObjectId[];
  aiGenerated: boolean;
  occasion: string;
  weather: string;
  createdAt: Date;
  updatedAt: Date;
}

const OutfitSchema = new Schema<IOutfit>(
  {
    userId: { type: String, required: true, index: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem' }],
    aiGenerated: { type: Boolean, default: false },
    occasion: { type: String, required: true },
    weather: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IOutfit>('Outfit', OutfitSchema);
