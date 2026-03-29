import { Router, Request, Response } from 'express';
import WearRecord from '../models/WearRecord';
import ClothingItem from '../models/ClothingItem';

const router = Router();

// POST /api/records — 新增穿搭记录
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, clothingItemIds, imageUrl, aiDescription, date, note } = req.body;

    const record = await WearRecord.create({
      userId,
      clothingItemIds: clothingItemIds || [],
      imageUrl,
      aiDescription,
      date: date ? new Date(date) : new Date(),
      note,
    });

    // 批量更新穿着统计
    if (clothingItemIds && clothingItemIds.length > 0) {
      await ClothingItem.updateMany(
        { _id: { $in: clothingItemIds } },
        {
          $inc: { wearCount: 1 },
          $set: { lastWornAt: new Date() },
        }
      );
    }

    res.status(201).json({ data: record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    const records = await WearRecord.find({
      userId,
      date: { $gte: startDate, $lt: endDate },
    })
      .populate('clothingItemIds')
      .sort({ date: -1 });

    return res.status(200).json({ data: records });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
