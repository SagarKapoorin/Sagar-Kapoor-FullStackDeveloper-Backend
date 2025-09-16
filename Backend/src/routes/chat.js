import express from 'express';
import { getChatResponse, getHistory, clearHistory, getTranscript } from '../services/chatService.js';
import createError from 'http-errors';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const query = req.body.query;
    const sessionId = req.sessionId;
    if (typeof sessionId !== 'string' || !sessionId) {
      throw new createError.BadRequest('Missing sessionId');
    }
    if (typeof query !== 'string' || !query.trim()) {
      throw new createError.BadRequest('Query must be a non-empty string');
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
    // Validate sessionId
    if (typeof sessionId !== 'string' || !sessionId) {
      throw new createError.BadRequest('Missing sessionId');
    }
    const history = await getHistory(sessionId);
    return res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
});

router.delete('/history', async (req, res, next) => {
  try {
    const sessionId = req.sessionId;
    if (typeof sessionId !== 'string' || !sessionId) {
      throw new createError.BadRequest('Missing sessionId');
    }
    await clearHistory(sessionId);
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
router.get('/transcript', async (req, res, next) => {
  try {
    const sessionId = req.sessionId;
    if (typeof sessionId !== 'string' || !sessionId) {
      throw new createError.BadRequest('Missing sessionId');
    }
    const transcript = await getTranscript(sessionId);
    return res.json({ success: true, transcript });
  } catch (err) {
    next(err);
  }
});

export default router;