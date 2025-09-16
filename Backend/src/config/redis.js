import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || process.env.redisUrl || "redis://127.0.0.1:6379";
export const client = createClient({
  url: redisUrl,
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  try {
    await client.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Could not connect to Redis", err);
  }
}

connectRedis();


