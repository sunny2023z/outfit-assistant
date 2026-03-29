import { Router, Request, Response } from 'express';
import * as recordsService from '../services/records.service';

const router = Router();

// POST /api/records — 新增穿搭记录
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, outfitId, date, note } = req.body;
    if (!userId || !outfitId || !date) {
      return res.status(400).json({ error: 'userId, outfitId and date are required' });
    }
    const record = await recordsService.createRecord({ userId, outfitId, date, note });
    return res.status(201).json({ data: record });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/records — 按月查询穿搭记录
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, year, month } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const y = year ? parseInt(year as string) : new Date().getFullYear();
    const m = month ? parseInt(month as string) : new Date().getMonth() + 1;

    const records = await recordsService.getRecordsByMonth(userId as string, y, m);
    return res.status(200).json({ data: records });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
