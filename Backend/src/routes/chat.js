import express from 'express';
import { getChatResponse, getHistory, clearHistory } from '../services/chatService.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { sessionId, query } = req.body;
    if (!sessionId || !query) {
      return res.status(400).json({ error: 'sessionId and query are required' });
    }
    const answer = await getChatResponse(sessionId, query);
    res.json({ answer });
  } catch (err) {
    next(err);
  }
});

router.get('/:sessionId/history', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const history = await getHistory(sessionId);
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

router.delete('/:sessionId/history', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await clearHistory(sessionId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;