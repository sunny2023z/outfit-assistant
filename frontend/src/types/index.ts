export interface ClothingItem {
  _id: string;
  userId: string;
  imageUrl: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';
  colors: string[];
  style: string[];
  seasons: string[];
  occasions: string[];
  createdAt: string;
  material: string;
  note: string;
  wearCount: number;
  lastWornAt: string | null;
}

export interface Outfit {
  _id: string;
  userId: string;
  items: string[];
  aiGenerated: boolean;
  occasion: string;
  weather: string;
  createdAt: string;
}

export interface WearRecord {
  _id: string;
  userId: string;
  outfitId?: string | Outfit;
  clothingItemIds: string[];
  imageUrl?: string;
  aiDescription?: string;
  date: string;
  note?: string;
}

export interface RecommendationResult {
  outfitId: string;
  items: Pick<ClothingItem, '_id' | 'category' | 'imageUrl' | 'colors'>[];
  reason: string;
}

export const CATEGORY_LABELS: Record<ClothingItem['category'], string> = {
  top: '上衣',
  bottom: '裤/裙',
  dress: '连衣裙',
  outerwear: '外套',
  shoes: '鞋子',
  accessory: '配饰',
};

export const OCCASION_OPTIONS = ['daily', 'work', 'date', 'sport', 'formal'];
export const OCCASION_LABELS: Record<string, string> = {
  daily: '日常',
  work: '上班',
  date: '约会',
  sport: '运动',
  formal: '正式',
};

export const WEATHER_OPTIONS = ['sunny', 'cloudy', 'rainy', 'snowy', 'hot', 'cold'];
export const WEATHER_LABELS: Record<string, string> = {
  sunny: '晴天',
  cloudy: '阴天',
  rainy: '下雨',
  snowy: '下雪',
  hot: '炎热',
  cold: '寒冷',
};
