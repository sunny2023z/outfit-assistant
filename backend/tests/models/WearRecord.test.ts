import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import WearRecord, { IWearRecord } from '../../src/models/WearRecord';

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
  await WearRecord.deleteMany({});
});

describe('WearRecord Model', () => {
  it('should create a WearRecord with required fields', async () => {
    const record = new WearRecord({
      userId: 'user123',
      outfitId: new mongoose.Types.ObjectId(),
      date: new Date('2026-03-29'),
    });
    const saved = await record.save();
    expect(saved._id).toBeDefined();
    expect(saved.userId).toBe('user123');
    expect(saved.date).toEqual(new Date('2026-03-29'));
  });

  it('should allow optional note field', async () => {
    const record = new WearRecord({
      userId: 'user123',
      outfitId: new mongoose.Types.ObjectId(),
      date: new Date(),
      note: '今天天气很好',
    });
    const saved = await record.save();
    expect(saved.note).toBe('今天天气很好');
  });

  it('should fail without required fields', async () => {
    const record = new WearRecord({});
    await expect(record.save()).rejects.toThrow();
  });
});
