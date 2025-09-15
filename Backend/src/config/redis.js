import mongoose from "mongoose";
import { createClient } from "redis";
const exec = mongoose.Query.prototype.exec;

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

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const result = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  const cached = await client.hGet(this.hashKey, result);

  if (cached) {
    console.log("SERVING FROM Cache");
    const doc = JSON.parse(cached);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  } else {
    console.log("SERVING FROM MongoDB");
    const output = await exec.apply(this, arguments);
    await client.hSet(this.hashKey, result, JSON.stringify(output));
    await client.expire(this.hashKey, 86400 * 5); // 5 days
    return output;
  }
};

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = options.key || "";
  return this; 
};

export const clearHash = async (hashKey) => {
  try {
    await client.del(hashKey);
    console.log(`Cleared hash for key: ${hashKey}`);
  } catch (error) {
    console.error(`Error clearing hash for key ${hashKey}:`, error);
  }
};
