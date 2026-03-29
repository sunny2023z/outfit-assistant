import mongoose, { Document, Schema } from 'mongoose';

export interface IWearRecord extends Document {
  userId: string;
  clothingItemIds: mongoose.Types.ObjectId[];
  imageUrl?: string;
  aiDescription?: string;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WearRecordSchema = new Schema<IWearRecord>(
  {
    userId: { type: String, required: true, index: true },
    clothingItemIds: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem' }],
    imageUrl: { type: String },
    aiDescription: { type: String },
    date: { type: Date, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

WearRecordSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IWearRecord>('WearRecord', WearRecordSchema);
