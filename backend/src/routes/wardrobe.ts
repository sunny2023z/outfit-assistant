import { Router, Request, Response } from 'express';
import * as wardrobeService from '../services/wardrobe.service';

const router = Router();

// POST /api/wardrobe/items — 新增单品
router.post('/items', async (req: Request, res: Response) => {
  try {
    const { userId, imageUrl, category, colors, style, seasons, occasions } = req.body;
    if (!userId || !imageUrl || !category || !colors) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const item = await wardrobeService.createItem({
      userId,
      imageUrl,
      category,
      colors,
      style,
      seasons,
      occasions,
    });
    return res.status(201).json({ data: item });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/wardrobe/items — 获取列表
router.get('/items', async (req: Request, res: Response) => {
  try {
    const { userId, category, seasons, occasions } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const items = await wardrobeService.getItems({
      userId: userId as string,
      category: category as string | undefined,
      seasons: seasons as string | undefined,
      occasions: occasions as string | undefined,
    });
    return res.status(200).json({ data: items });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/wardrobe/items/:id — 更新标签
router.put('/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await wardrobeService.updateItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json({ data: item });
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/wardrobe/items/:id — 删除单品
router.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await wardrobeService.deleteItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
