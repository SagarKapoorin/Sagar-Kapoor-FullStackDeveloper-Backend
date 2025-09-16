import axios from 'axios';
import Article from '../models/article.js';
import { client as redisClient } from '../config/redis.js';
import ChatSession from '../models/chatSession.js';
import { getJinaEmbeddings } from '../lib/jina.js';
import createError from 'http-errors';


const TOP_K = parseInt(process.env.TOP_K, 10) || 5;
const CHAT_HISTORY_TTL = parseInt(process.env.CHAT_HISTORY_TTL, 10) || 86400;

export const getChatResponse = async (sessionId, query) => {
  if (typeof query !== 'string' || !query.trim()) {
    throw new createError.BadRequest('Query must be a non-empty string');
  }
  try {
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

  const now = new Date();
  const userMsg = { role: 'user', text: query, timestamp: now };
  const botMsg = { role: 'bot', text: answer, timestamp: now };
  const historyKey = `chat:${sessionId}`;
//multi to execute multiple statement together for bot and user message
  redisClient
    .multi()
    .rPush(historyKey, JSON.stringify(userMsg), JSON.stringify(botMsg))
    .expire(historyKey, CHAT_HISTORY_TTL)
    .exec()
    .catch((err) => console.error('Redis persistence error', err));

  
  ChatSession.findOneAndUpdate(
    { sessionId },
    { $push: { messages: { $each: [userMsg, botMsg] } } },
    { upsert: true }
  )
    .exec()
    .catch((err) => console.error('Mongo persistence error', err));
    return answer;
  } catch (err) {
    console.error('getChatResponse error', err);
    if (err.isAxiosError || err.response) {
      throw new createError.BadGateway('Upstream service error');
    }
    throw new createError.InternalServerError('Failed to generate chat response');
  }
};

export const getHistory = async (sessionId) => {
  if (typeof sessionId !== 'string' || !sessionId) {
    throw new createError.BadRequest('Invalid sessionId');
  }
  try {
    const historyKey = `chat:${sessionId}`;
    const entries = await redisClient.lRange(historyKey, 0, -1);
    if (entries.length > 0) {
      return entries.map((e) => JSON.parse(e));
    }
    const doc = await ChatSession.findOne({ sessionId });
    return doc?.messages || [];
  } catch (err) {
    console.error('getHistory error', err);
    throw new createError.InternalServerError('Could not retrieve chat history');
  }
};

export const clearHistory = async (sessionId) => {
  if (typeof sessionId !== 'string' || !sessionId) {
    throw new createError.BadRequest('Invalid sessionId');
  }
  try {
    const historyKey = `chat:${sessionId}`;
    await redisClient.del(historyKey);
    await ChatSession.findOneAndUpdate(
      { sessionId },
      { messages: [] },
      { upsert: true }
    );
  } catch (err) {
    console.error('clearHistory error', err);
    throw new createError.InternalServerError('Could not clear chat history');
  }
};
export const getTranscript = async (sessionId) => {
  if (typeof sessionId !== 'string' || !sessionId) {
    throw new createError.BadRequest('Invalid sessionId');
  }
  try {
    const doc = await ChatSession.findOne({ sessionId });
    return doc?.messages || [];
  } catch (err) {
    console.error('getTranscript error', err);
    throw new createError.InternalServerError('Could not retrieve transcript');
  }
};