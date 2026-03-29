import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/index';
import ClothingItem from '../../src/models/ClothingItem';

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

const mockItem = {
  userId: 'user123',
  imageUrl: 'https://example.com/image.jpg',
  category: 'top',
  colors: ['white'],
  style: ['casual'],
  seasons: ['spring'],
  occasions: ['daily'],
};

describe('POST /api/wardrobe/items', () => {
  it('should create a new clothing item', async () => {
    const res = await request(app).post('/api/wardrobe/items').send(mockItem);
    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe('user123');
    expect(res.body.data.category).toBe('top');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/wardrobe/items').send({ userId: 'user123' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/wardrobe/items', () => {
  it('should return items for a user', async () => {
    await ClothingItem.create(mockItem);
    const res = await request(app).get('/api/wardrobe/items').query({ userId: 'user123' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by category', async () => {
    await ClothingItem.create(mockItem);
    await ClothingItem.create({ ...mockItem, category: 'bottom' });
    const res = await request(app)
      .get('/api/wardrobe/items')
      .query({ userId: 'user123', category: 'top' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe('top');
  });

  it('should return 400 if userId is missing', async () => {
    const res = await request(app).get('/api/wardrobe/items');
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/wardrobe/items/:id', () => {
  it('should update clothing item tags', async () => {
    const item = await ClothingItem.create(mockItem);
    const res = await request(app)
      .put(`/api/wardrobe/items/${item._id}`)
      .send({ colors: ['black', 'white'], occasions: ['work', 'daily'] });
    expect(res.status).toBe(200);
    expect(res.body.data.colors).toEqual(['black', 'white']);
    expect(res.body.data.occasions).toEqual(['work', 'daily']);
  });

  it('should return 404 for non-existent item', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/wardrobe/items/${fakeId}`)
      .send({ colors: ['red'] });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/wardrobe/items/:id', () => {
  it('should delete a clothing item', async () => {
    const item = await ClothingItem.create(mockItem);
    const res = await request(app).delete(`/api/wardrobe/items/${item._id}`);
    expect(res.status).toBe(200);
    const found = await ClothingItem.findById(item._id);
    expect(found).toBeNull();
  });

  it('should return 404 for non-existent item', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/wardrobe/items/${fakeId}`);
    expect(res.status).toBe(404);
  });
});
