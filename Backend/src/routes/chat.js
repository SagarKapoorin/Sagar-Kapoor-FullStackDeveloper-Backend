import express from 'express';
import { getChatResponse, getHistory, clearHistory, getTranscript } from '../services/chatService.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const query = req.body.query;
    const sessionId = req.sessionId;
    if (!query) {
      return res.status(400).json({ success: false, error: 'query is required' });
    }
    const answer = await getChatResponse(sessionId, query);
    return res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const sessionId = req.sessionId;
    const history = await getHistory(sessionId);
    return res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
});

router.delete('/history', async (req, res, next) => {
  try {
    const sessionId = req.sessionId;
    await clearHistory(sessionId);
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
router.get('/transcript', async (req, res, next) => {
  try {
    const sessionId = req.sessionId;
    const transcript = await getTranscript(sessionId);
    return res.json({ success: true, transcript });
  } catch (err) {
    next(err);
  }
});

export default router;