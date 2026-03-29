import { Router, Request, Response } from 'express';
import { getRecommendations } from '../services/recommend.service';

const router = Router();

// POST /api/recommend
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, occasion, weather } = req.body;
    if (!userId || !occasion || !weather) {
      return res.status(400).json({ error: 'userId, occasion and weather are required' });
    }

    const recommendations = await getRecommendations(userId, occasion, weather);
    return res.status(200).json({ data: recommendations });
  } catch (err: any) {
    if (err.message === 'No clothing items found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
