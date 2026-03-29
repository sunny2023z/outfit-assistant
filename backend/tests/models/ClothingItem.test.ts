import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ClothingItem, { IClothingItem } from '../../src/models/ClothingItem';

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
});

describe('ClothingItem Model', () => {
  it('should create a ClothingItem with required fields', async () => {
    const item = new ClothingItem({
      userId: 'user123',
      imageUrl: 'https://example.com/image.jpg',
      category: 'top',
      colors: ['white', 'blue'],
      style: ['casual'],
      seasons: ['spring', 'summer'],
      occasions: ['daily'],
    });
    const saved = await item.save();
    expect(saved._id).toBeDefined();
    expect(saved.userId).toBe('user123');
    expect(saved.category).toBe('top');
    expect(saved.colors).toEqual(['white', 'blue']);
    expect(saved.createdAt).toBeDefined();
  });

  it('should fail without required fields', async () => {
    const item = new ClothingItem({});
    await expect(item.save()).rejects.toThrow();
  });

  it('should reject invalid category', async () => {
    const item = new ClothingItem({
      userId: 'user123',
      imageUrl: 'https://example.com/image.jpg',
      category: 'invalid_category',
      colors: ['red'],
      style: ['casual'],
      seasons: ['spring'],
      occasions: ['daily'],
    });
    await expect(item.save()).rejects.toThrow();
  });
});
