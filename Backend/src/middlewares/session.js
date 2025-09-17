import { v4 as uuidv4 } from 'uuid';

export function sessionMiddleware(req, res, next) {
  let sid = req.cookies && req.cookies.sessionId;
  if (!sid) {
    sid = uuidv4();
    const ttlSeconds = parseInt(process.env.CHAT_HISTORY_TTL, 10) || 86400;
    const ttlMs = ttlSeconds * 1000;
    const isProd = process.env.NODE_ENV === 'production';
    const sameSite = (isProd ? 'strict' : 'lax');
    const secure = isProd;
    res.cookie('sessionId', sid, {
      httpOnly: true,
      sameSite,
      secure,
      maxAge: ttlMs,
    });
  }
  req.sessionId = sid;
  next();
}