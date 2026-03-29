import Taro from '@tarojs/taro';
import { ClothingItem, WearRecord, RecommendationResult } from '../types';

const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'https://outfit-assistant.jellyzen.fun'
  : 'https://outfit-assistant.jellyzen.fun';

const request = <T>(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
}): Promise<T> => {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else {
          reject(new Error(`Request failed: ${res.statusCode}`));
        }
      },
      fail: reject,
    });
  });
};

export const wardrobeApi = {
  getItems: (userId: string, filters?: { category?: string }) =>
    request<{ data: ClothingItem[] }>({
      url: '/api/wardrobe/items',
      data: { userId, ...filters },
    }),
  createItem: (data: Partial<ClothingItem>) =>
    request<{ data: ClothingItem }>({ url: '/api/wardrobe/items', method: 'POST', data }),
  updateItem: (id: string, data: Partial<ClothingItem>) =>
    request<{ data: ClothingItem }>({ url: `/api/wardrobe/items/${id}`, method: 'PUT', data }),
  deleteItem: (id: string) =>
    request<{ message: string }>({ url: `/api/wardrobe/items/${id}`, method: 'DELETE' }),
  updateNote: (id: string, note: string) =>
    request<{ data: ClothingItem }>({ url: `/api/wardrobe/items/${id}/note`, method: 'PUT', data: { note } }),
};

export const recommendApi = {
  getRecommendations: (userId: string, occasion: string, weather: string) =>
    request<{ data: RecommendationResult[] }>({
      url: '/api/recommend',
      method: 'POST',
      data: { userId, occasion, weather },
    }),
};

export const recordsApi = {
  getRecords: (userId: string, year: number, month: number) =>
    request<{ data: WearRecord[] }>({
      url: '/api/records',
      data: { userId, year, month },
    }),
  createRecord: (data: { userId: string; outfitId?: string; clothingItemIds?: string[]; imageUrl?: string; aiDescription?: string; date: string; note?: string }) =>
    request<{ data: WearRecord }>({ url: '/api/records', method: 'POST', data }),
};

export const ootdApi = {
  upload: (userId: string, filePath: string) => {
    return new Promise<{ url: string; recognition: { description: string; items: Array<{ category: string; colors: string[]; material: string; description: string }> } }>((resolve, reject) => {
      Taro.uploadFile({
        url: `https://outfit-assistant.jellyzen.fun/api/upload/ootd`,
        filePath,
        name: 'image',
        formData: { userId },
        success: (res) => {
          try {
            resolve(JSON.parse(res.data));
          } catch {
            reject(new Error('Parse failed'));
          }
        },
        fail: reject,
      });
    });
  },
};
