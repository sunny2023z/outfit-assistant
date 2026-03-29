import { getRecommendations } from '../../src/services/recommend.service';
import * as aiService from '../../src/services/ai.service';
import ClothingItem from '../../src/models/ClothingItem';
import Outfit from '../../src/models/Outfit';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('../../src/services/ai.service');
const mockedAI = aiService as jest.Mocked<typeof aiService>;

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await ClothingItem.deleteMany({});
  await Outfit.deleteMany({});
});

describe('Recommend Service', () => {
  it('should return 3 outfit recommendations', async () => {
    // 准备衣橱数据
    const item1 = await ClothingItem.create({
      userId: 'user123', imageUrl: 'https://example.com/1.jpg',
      category: 'top', colors: ['white'], style: ['casual'], seasons: ['spring'], occasions: ['daily'],
    });
    const item2 = await ClothingItem.create({
      userId: 'user123', imageUrl: 'https://example.com/2.jpg',
      category: 'bottom', colors: ['blue'], style: ['casual'], seasons: ['spring'], occasions: ['daily'],
    });

    mockedAI.generateOutfitRecommendation.mockResolvedValueOnce({
      outfits: [
        { items: [item1._id.toString(), item2._id.toString()], reason: '简约休闲搭配' },
        { items: [item1._id.toString()], reason: '上衣单搭' },
        { items: [item2._id.toString()], reason: '下装百搭' },
      ]
    });

    const result = await getRecommendations('user123', 'daily', 'sunny');
    expect(result).toHaveLength(3);
    expect(result[0].reason).toBe('简约休闲搭配');
  });

  it('should save generated outfits to database', async () => {
    const item = await ClothingItem.create({
      userId: 'user123', imageUrl: 'https://example.com/1.jpg',
      category: 'top', colors: ['white'], style: ['casual'], seasons: ['spring'], occasions: ['daily'],
    });

    mockedAI.generateOutfitRecommendation.mockResolvedValueOnce({
      outfits: [
        { items: [item._id.toString()], reason: '测试搭配' },
        { items: [item._id.toString()], reason: '测试搭配2' },
        { items: [item._id.toString()], reason: '测试搭配3' },
      ]
    });

    await getRecommendations('user123', 'work', 'cloudy');
    const savedOutfits = await Outfit.find({ userId: 'user123' });
    expect(savedOutfits.length).toBeGreaterThan(0);
    expect(savedOutfits[0].aiGenerated).toBe(true);
  });

  it('should throw if user has no wardrobe items', async () => {
    await expect(getRecommendations('empty_user', 'daily', 'sunny'))
      .rejects.toThrow('No clothing items found');
  });
});
