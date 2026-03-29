import ClothingItem, { IClothingItem } from '../models/ClothingItem';
import mongoose from 'mongoose';

export interface WardrobeFilter {
  userId: string;
  category?: string;
  seasons?: string;
  occasions?: string;
}

export const createItem = async (
  data: Partial<IClothingItem>
): Promise<IClothingItem> => {
  const item = new ClothingItem(data);
  return item.save();
};

export const getItems = async (
  filter: WardrobeFilter
): Promise<IClothingItem[]> => {
  const query: Record<string, any> = { userId: filter.userId };
  if (filter.category) query.category = filter.category;
  if (filter.seasons) query.seasons = filter.seasons;
  if (filter.occasions) query.occasions = filter.occasions;
  return ClothingItem.find(query).sort({ createdAt: -1 });
};

export const updateItem = async (
  id: string,
  data: Partial<IClothingItem>
): Promise<IClothingItem | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return ClothingItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteItem = async (id: string): Promise<IClothingItem | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return ClothingItem.findByIdAndDelete(id);
};
