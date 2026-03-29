import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Outfit, { IOutfit } from '../../src/models/Outfit';

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
  await Outfit.deleteMany({});
});

describe('Outfit Model', () => {
  it('should create an Outfit with required fields', async () => {
    const outfit = new Outfit({
      userId: 'user123',
      items: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      aiGenerated: true,
      occasion: 'work',
      weather: 'sunny',
    });
    const saved = await outfit.save();
    expect(saved._id).toBeDefined();
    expect(saved.userId).toBe('user123');
    expect(saved.items).toHaveLength(2);
    expect(saved.aiGenerated).toBe(true);
    expect(saved.createdAt).toBeDefined();
  });

  it('should default aiGenerated to false', async () => {
    const outfit = new Outfit({
      userId: 'user123',
      items: [],
      occasion: 'daily',
      weather: 'cloudy',
    });
    const saved = await outfit.save();
    expect(saved.aiGenerated).toBe(false);
  });

  it('should fail without required fields', async () => {
    const outfit = new Outfit({});
    await expect(outfit.save()).rejects.toThrow();
  });
});
