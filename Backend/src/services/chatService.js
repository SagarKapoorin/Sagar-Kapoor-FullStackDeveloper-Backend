import axios from 'axios';
import Article from '../models/article.js';
import { client as redisClient } from '../config/redis.js';
import { getJinaEmbeddings } from '../lib/jina.js';


const TOP_K = parseInt(process.env.TOP_K, 10) || 5;
const CHAT_HISTORY_TTL = parseInt(process.env.CHAT_HISTORY_TTL, 10) || 86400;

export const getChatResponse = async (sessionId, query) => {
  // Embed query using hosted Jina API
  const [queryEmbedding] = await getJinaEmbeddings([query]);
  // Perform vector similarity search against MongoDB's vector index
  const rawResults = await Article.collection.find({
    $vectorSearch: { vector: queryEmbedding, path: 'embedding', k: TOP_K }
  }).toArray();
  const passages = rawResults.map((d) => d.content || '');
  const context = passages.join('\n\n');
  const geminiRes = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: `Context: ${context}\n\nUser: ${query}\n\nAnswer:` }] }]
    }
  );
  const answer = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const historyKey = `chat:${sessionId}`;
  await redisClient.rPush(historyKey, JSON.stringify({ role: 'user', text: query }));
  await redisClient.rPush(historyKey, JSON.stringify({ role: 'bot', text: answer }));
  await redisClient.expire(historyKey, CHAT_HISTORY_TTL);

  return answer;
};

export const getHistory = async (sessionId) => {
  const historyKey = `chat:${sessionId}`;
  const entries = await redisClient.lRange(historyKey, 0, -1);
  return entries.map((e) => JSON.parse(e));
};

export const clearHistory = async (sessionId) => {
  await redisClient.del(`chat:${sessionId}`);
};