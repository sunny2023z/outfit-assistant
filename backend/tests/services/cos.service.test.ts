import { uploadFile, getFileUrl } from '../../src/services/cos.service';

// Mock COS SDK
jest.mock('cos-nodejs-sdk-v5', () => {
  return jest.fn().mockImplementation(() => ({
    putObject: jest.fn((params: any, callback: Function) => {
      callback(null, { statusCode: 200, Location: `${params.Bucket}.cos.${params.Region}.myqcloud.com/${params.Key}` });
    }),
  }));
});

describe('COS Service', () => {
  beforeEach(() => {
    process.env.COS_SECRET_ID = 'test-secret-id';
    process.env.COS_SECRET_KEY = 'test-secret-key';
    process.env.COS_BUCKET = 'test-bucket-1234567890';
    process.env.COS_REGION = 'ap-guangzhou';
  });

  describe('uploadFile', () => {
    it('should upload a file and return the URL', async () => {
      const buffer = Buffer.from('fake-image-data');
      const key = 'wardrobe/user123/test-image.jpg';
      const url = await uploadFile(buffer, key, 'image/jpeg');
      expect(url).toContain(key);
      expect(url).toContain('cos');
    });

    it('should throw an error if upload fails', async () => {
      const COS = require('cos-nodejs-sdk-v5');
      COS.mockImplementationOnce(() => ({
        putObject: jest.fn((_params: any, callback: Function) => {
          callback(new Error('Upload failed'), null);
        }),
      }));
      const buffer = Buffer.from('fake-image-data');
      await expect(uploadFile(buffer, 'test/key.jpg', 'image/jpeg')).rejects.toThrow('Upload failed');
    });
  });

  describe('getFileUrl', () => {
    it('should return a formatted COS URL', () => {
      const url = getFileUrl('wardrobe/user123/image.jpg');
      expect(url).toContain('wardrobe/user123/image.jpg');
      expect(url).toContain('cos');
    });
  });
});
