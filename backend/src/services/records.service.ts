import WearRecord, { IWearRecord } from '../models/WearRecord';
import mongoose from 'mongoose';

export interface CreateRecordData {
  userId: string;
  outfitId: string;
  date: Date | string;
  note?: string;
}

export const createRecord = async (data: CreateRecordData): Promise<IWearRecord> => {
  const record = new WearRecord({
    userId: data.userId,
    outfitId: new mongoose.Types.ObjectId(data.outfitId),
    date: new Date(data.date),
    note: data.note,
  });
  return record.save();
};

export const getRecordsByMonth = async (
  userId: string,
  year: number,
  month: number
): Promise<IWearRecord[]> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return WearRecord.find({
    userId,
    date: { $gte: startDate, $lt: endDate },
  })
    .populate('outfitId')
    .sort({ date: -1 });
};
