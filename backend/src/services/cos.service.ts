import COS from 'cos-nodejs-sdk-v5';

const getCosClient = () => {
  return new COS({
    SecretId: process.env.COS_SECRET_ID!,
    SecretKey: process.env.COS_SECRET_KEY!,
  });
};

/**
 * 上传文件到 COS
 * @param buffer 文件 Buffer
 * @param key COS 对象键，如 wardrobe/userId/filename.jpg
 * @param contentType MIME 类型
 * @returns 文件访问 URL
 */
export const uploadFile = (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const cos = getCosClient();
  const bucket = process.env.COS_BUCKET!;
  const region = process.env.COS_REGION!;

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(`https://${bucket}.cos.${region}.myqcloud.com/${key}`);
        }
      }
    );
  });
};

/**
 * 获取 COS 文件的访问 URL
 */
export const getFileUrl = (key: string): string => {
  const bucket = process.env.COS_BUCKET!;
  const region = process.env.COS_REGION!;
  return `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
};

/**
 * 生成唯一文件 key
 */
export const generateKey = (userId: string, originalName: string): string => {
  const ext = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `wardrobe/${userId}/${timestamp}-${random}.${ext}`;
};
