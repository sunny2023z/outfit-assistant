import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import app from '../../src/index';

let mongoServer: MongoMemoryServer;

// Mock cos.service
jest.mock('../../src/services/cos.service', () => ({
  uploadFile: jest.fn().mockResolvedValue('https://test-bucket.cos.ap-guangzhou.myqcloud.com/wardrobe/user123/test.jpg'),
  getFileUrl: jest.fn().mockReturnValue('https://test-bucket.cos.ap-guangzhou.myqcloud.com/wardrobe/user123/test.jpg'),
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/upload', () => {
  it('should upload an image and return a URL', async () => {
    const res = await request(app)
      .post('/api/upload')
      .field('userId', 'user123')
      .attach('image', Buffer.from('fake-image'), { filename: 'test.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(200);
    expect(res.body.url).toContain('cos');
  });

  it('should return 400 if no image is provided', async () => {
    const res = await request(app)
      .post('/api/upload')
      .field('userId', 'user123');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No image file provided');
  });

  it('should return 400 if userId is missing', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.from('fake-image'), { filename: 'test.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('userId is required');
  });
});
