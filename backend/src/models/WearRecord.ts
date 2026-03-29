import mongoose, { Document, Schema } from 'mongoose';

export interface IWearRecord extends Document {
  userId: string;
  outfitId: mongoose.Types.ObjectId;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WearRecordSchema = new Schema<IWearRecord>(
  {
    userId: { type: String, required: true, index: true },
    outfitId: { type: Schema.Types.ObjectId, ref: 'Outfit', required: true },
    date: { type: Date, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

// 按用户+日期索引，方便查询某月记录
WearRecordSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IWearRecord>('WearRecord', WearRecordSchema);
