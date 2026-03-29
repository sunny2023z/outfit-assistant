import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/index';
import WearRecord from '../../src/models/WearRecord';
import Outfit from '../../src/models/Outfit';

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
  await Outfit.deleteMany({});
});

describe('POST /api/records', () => {
  it('should create a wear record', async () => {
    const outfit = await Outfit.create({
      userId: 'user123',
      items: [],
      aiGenerated: false,
      occasion: 'daily',
      weather: 'sunny',
    });

    const res = await request(app).post('/api/records').send({
      userId: 'user123',
      outfitId: outfit._id.toString(),
      date: '2026-03-29',
      note: '今天天气很好',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe('user123');
    expect(res.body.data.note).toBe('今天天气很好');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/records').send({ userId: 'user123' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/records', () => {
  it('should return records for a user by month', async () => {
    const outfit = await Outfit.create({
      userId: 'user123', items: [], aiGenerated: false, occasion: 'daily', weather: 'sunny',
    });

    await WearRecord.create({ userId: 'user123', outfitId: outfit._id, date: new Date('2026-03-01') });
    await WearRecord.create({ userId: 'user123', outfitId: outfit._id, date: new Date('2026-03-15') });
    await WearRecord.create({ userId: 'user123', outfitId: outfit._id, date: new Date('2026-04-01') });

    const res = await request(app)
      .get('/api/records')
      .query({ userId: 'user123', year: '2026', month: '3' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('should return 400 if userId is missing', async () => {
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(400);
  });
});
