import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadFile, generateKey } from '../services/cos.service';
import { recognizeClothing, recognizeOotd, OotdRecognitionResult } from '../services/ai.service';

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

// POST /api/upload/ootd - 上传 OOTD 照片并 AI 识别
router.post('/ootd', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  try {
    const { userId = 'user123' } = req.body;
    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const key = `ootd/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // 上传到 COS
    const imageUrl = await uploadFile(req.file.buffer, key, req.file.mimetype);

    // AI 识别 OOTD
    let recognition: OotdRecognitionResult = { description: '', items: [] };
    try {
      recognition = await recognizeOotd(imageUrl);
    } catch (err) {
      console.error('OOTD recognition failed:', err);
    }

    res.json({ url: imageUrl, recognition });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
