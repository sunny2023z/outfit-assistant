import ClothingItem from '../models/ClothingItem';
import Outfit from '../models/Outfit';
import { generateOutfitRecommendation } from './ai.service';
import mongoose from 'mongoose';

export interface RecommendationResult {
  outfitId: string;
  items: Array<{
    _id: string;
    category: string;
    imageUrl: string;
    colors: string[];
  }>;
  reason: string;
}

export const getRecommendations = async (
  userId: string,
  occasion: string,
  weather: string
): Promise<RecommendationResult[]> => {
  // 获取用户衣橱
  const wardrobeItems = await ClothingItem.find({ userId });
  if (!wardrobeItems.length) {
    throw new Error('No clothing items found');
  }

  // 准备给 AI 的数据（精简，减少 token 消耗）
  const itemsForAI = wardrobeItems.map(item => ({
    id: (item._id as mongoose.Types.ObjectId).toString(),
    category: item.category,
    colors: item.colors,
    style: item.style,
    occasions: item.occasions,
  }));

  // 调用 AI 推荐
  const recommendation = await generateOutfitRecommendation(itemsForAI, occasion, weather);

  // 保存推荐结果到数据库，并构建返回数据
  const results: RecommendationResult[] = [];

  for (const outfitData of recommendation.outfits) {
    // 找到对应的衣物详情
    const itemIds = outfitData.items
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    const items = await ClothingItem.find({ _id: { $in: itemIds } });

    // 保存 Outfit 记录
    const outfit = await Outfit.create({
      userId,
      items: itemIds,
      aiGenerated: true,
      occasion,
      weather,
    });

    results.push({
      outfitId: (outfit._id as mongoose.Types.ObjectId).toString(),
      items: items.map(item => ({
        _id: (item._id as mongoose.Types.ObjectId).toString(),
        category: item.category,
        imageUrl: item.imageUrl,
        colors: item.colors,
      })),
      reason: outfitData.reason,
    });
  }

  return results;
};
