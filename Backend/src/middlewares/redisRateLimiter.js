import { RateLimiterRedis } from "rate-limiter-flexible";
import { client } from "../config/redis";

// 100 requests per 60 seconds
const rateLimiter = new RateLimiterRedis({
  storeClient: client,
  keyPrefix: "rl",
  points: 100,     
  duration: 60,    
});

export const redisRateLimiter = (req, res, next) => {
  const key = req.ip; 

  rateLimiter.consume(key)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ error: "Too many requests, please slow down 🚦" });
    });
};