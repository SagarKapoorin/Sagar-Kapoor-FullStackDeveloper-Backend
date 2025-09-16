import { v4 as uuidv4 } from 'uuid';

export function sessionMiddleware(req, res, next) {
  // Read sessionId from cookie; generate if missing
  let sid = req.cookies && req.cookies.sessionId;
  if (!sid) {
    sid = uuidv4();
    const ttlSeconds = parseInt(process.env.CHAT_HISTORY_TTL, 10) || 86400;
    const ttlMs = ttlSeconds * 1000;
    res.cookie('sessionId', sid, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ttlMs,
    });
  }
  // Attach to request for downstream handlers
  req.sessionId = sid;
  next();
}