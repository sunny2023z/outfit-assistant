import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadFile, generateKey } from '../services/cos.service';
import { recognizeClothing } from '../services/ai.service';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/upload — 上传图片并 AI 识别
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // 1. 上传到 COS
    const key = generateKey(userId, req.file.originalname);
    const url = await uploadFile(req.file.buffer, key, req.file.mimetype);

    // 2. AI 识别（非阻塞，失败不影响上传结果）
    let recognition = null;
    try {
      recognition = await recognizeClothing(url);
    } catch (err) {
      console.warn('AI recognition failed, skipping:', err);
    }

    return res.status(200).json({ url, key, recognition });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

export default router;
