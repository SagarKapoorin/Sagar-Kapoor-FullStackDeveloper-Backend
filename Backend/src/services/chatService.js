import axios from 'axios';
import Article from '../models/article.js';
import { client as redisClient } from '../config/redis.js';
import ChatSession from '../models/chatSession.js';
import { getJinaEmbeddings } from '../lib/jina.js';


const TOP_K = parseInt(process.env.TOP_K, 10) || 5;
const CHAT_HISTORY_TTL = parseInt(process.env.CHAT_HISTORY_TTL, 10) || 86400;

export const getChatResponse = async (sessionId, query) => {
  const [queryEmbedding] = await getJinaEmbeddings([query]);
  //performing vector similarity search against MongoDB vector index
const rawResults = await Article.collection.aggregate([
  {
    $vectorSearch: {
      index: 'embedding_vector_idx', 
      path: 'embedding',
      queryVector: queryEmbedding,
      numCandidates: 100,     
      limit: TOP_K             
    }
  },
  {
    $project: {
      content: 1,
      score: { $meta: 'vectorSearchScore' }
    }
  }
]).toArray();

  const passages = rawResults.map((d) => d.content || '');
  const context = passages.join('\n\n');
  const geminiRes = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
    {
      contents: [{ parts: [{ text: `Context: ${context}\n\nUser: ${query}\n\nAnswer:` }] }]
    },
        {
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    }
  }
  );
  const answer = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const historyKey = `chat:${sessionId}`;
  await redisClient.rPush(historyKey, JSON.stringify({ role: 'user', text: query }));
  // Persist user message in MongoDB
  await ChatSession.findOneAndUpdate(
    { sessionId },
    { $push: { messages: { role: 'user', text: query, timestamp: new Date() } } },
    { upsert: true }
  );
  await redisClient.rPush(historyKey, JSON.stringify({ role: 'bot', text: answer }));
  // Persist bot message in MongoDB
  await ChatSession.findOneAndUpdate(
    { sessionId },
    { $push: { messages: { role: 'bot', text: answer, timestamp: new Date() } } }
  );
  await redisClient.expire(historyKey, CHAT_HISTORY_TTL);

  return answer;
};

export const getHistory = async (sessionId) => {
  const historyKey = `chat:${sessionId}`;
  // Try reading transient history from Redis first
  const entries = await redisClient.lRange(historyKey, 0, -1);
  if (entries.length > 0) {
    return entries.map((e) => JSON.parse(e));
  }
  // Fallback to permanent transcript in MongoDB
  const doc = await ChatSession.findOne({ sessionId });
  return doc?.messages || [];
};

export const clearHistory = async (sessionId) => {
  const historyKey = `chat:${sessionId}`;
  // Clear Redis transient history
  await redisClient.del(historyKey);
  // Clear MongoDB transcript messages for this session
  await ChatSession.findOneAndUpdate(
    { sessionId },
    { messages: [] },
    { upsert: true }
  );
};
// Retrieve the full permanent transcript from MongoDB
export const getTranscript = async (sessionId) => {
  const doc = await ChatSession.findOne({ sessionId });
  return doc?.messages || [];
};