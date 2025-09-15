import axios from 'axios';
import Article from '../models/article.js';
import { client as redisClient } from '../config/redis.js';

const JINA_HOST = process.env.JINA_HOST || 'localhost';
const JINA_PORT = process.env.JINA_PORT || '45678';
const jinaUrl = `http://${JINA_HOST}:${JINA_PORT}`;

const TOP_K = parseInt(process.env.TOP_K, 10) || 5;
const CHAT_HISTORY_TTL = parseInt(process.env.CHAT_HISTORY_TTL, 10) || 86400;

export const getChatResponse = async (sessionId, query) => {
  const embedRes = await axios.post(`${jinaUrl}/encode`, { data: [query] });
  const queryEmbedding = embedRes.data.documents?.[0]?.embedding;
  const searchRes = await axios.post(`${jinaUrl}/search`, {
    data: [query],
    parameters: { top_k: TOP_K }
  });
  const docs = searchRes.data.search?.[0]?.data?.[0]?.docs || [];
  const passages = docs.map((d) => d.content || d.tags?.content || '');
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