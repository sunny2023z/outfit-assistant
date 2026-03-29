import { recognizeClothing, generateOutfitRecommendation, AIRecognitionResult } from '../../src/services/ai.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AI Service - recognizeClothing', () => {
  beforeEach(() => {
    process.env.HUNYUAN_API_KEY = 'test-api-key';
  });

  it('should recognize clothing from image URL', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              category: 'top',
              colors: ['white', 'blue'],
              style: ['casual', 'minimalist'],
              seasons: ['spring', 'summer'],
              occasions: ['daily', 'work'],
            })
          }
        }]
      }
    });

    const result = await recognizeClothing('https://example.com/image.jpg');
    expect(result.category).toBe('top');
    expect(result.colors).toContain('white');
    expect(result.style).toContain('casual');
  });

  it('should handle API errors gracefully', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API error'));
    await expect(recognizeClothing('https://example.com/image.jpg')).rejects.toThrow('AI recognition failed');
  });

  it('should handle malformed API response', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { choices: [{ message: { content: 'not valid json' } }] }
    });
    // 应返回默认值而非抛出错误
    const result = await recognizeClothing('https://example.com/image.jpg');
    expect(result.category).toBe('top'); // 默认值
    expect(result.colors).toEqual([]);
  });
});
