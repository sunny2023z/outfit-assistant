import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/index';
import * as recommendService from '../../src/services/recommend.service';

jest.mock('../../src/services/recommend.service');
const mockedRecommend = recommendService as jest.Mocked<typeof recommendService>;

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/recommend', () => {
  it('should return outfit recommendations', async () => {
    mockedRecommend.getRecommendations.mockResolvedValueOnce([
      { outfitId: 'outfit1', items: [], reason: '休闲搭配' },
      { outfitId: 'outfit2', items: [], reason: '通勤搭配' },
      { outfitId: 'outfit3', items: [], reason: '约会搭配' },
    ]);

    const res = await request(app).post('/api/recommend').send({
      userId: 'user123',
      occasion: 'daily',
      weather: 'sunny',
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('should return 400 if required fields missing', async () => {
    const res = await request(app).post('/api/recommend').send({ userId: 'user123' });
    expect(res.status).toBe(400);
  });

  it('should return 404 if no wardrobe items', async () => {
    mockedRecommend.getRecommendations.mockRejectedValueOnce(new Error('No clothing items found'));
    const res = await request(app).post('/api/recommend').send({
      userId: 'empty_user',
      occasion: 'daily',
      weather: 'sunny',
    });
    expect(res.status).toBe(404);
  });
});
