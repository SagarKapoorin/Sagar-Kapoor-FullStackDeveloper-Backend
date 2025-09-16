import express from 'express';
import { getChatResponse, getHistory, clearHistory } from '../services/chatService.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { sessionId, query } = req.body;
    if (!sessionId || !query) {
      // Missing required parameters
      return res.status(400).json({ success: false, error: 'sessionId and query are required' });
    }
    const answer = await getChatResponse(sessionId, query);
    // Return success flag along with answer
    return res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
});

router.get('/:sessionId/history', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const history = await getHistory(sessionId);
    // Return success flag along with history
    return res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
});

router.delete('/:sessionId/history', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    // Clear stored chat history and respond with success
    await clearHistory(sessionId);
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;