import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import mongoose from 'mongoose';
import Parser from 'rss-parser';
import axios from 'axios';
import Article from '../models/article.js';

const MONGO_URL = process.env.MONGO_URL;
const JINA_HOST = process.env.JINA_HOST || 'localhost';
const JINA_PORT = process.env.JINA_PORT || '45678';
const jinaUrl = `http://${JINA_HOST}:${JINA_PORT}`;
const RSS_FEED_URL = process.env.RSS_FEED_URL;
const MAX_ARTICLES = 50;

async function seed() {
  if (!MONGO_URL) {
    console.error('Missing MONGO_URL');
    process.exit(1);
  }
  if (!RSS_FEED_URL) {
    console.error('Missing RSS_FEED_URL');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB');

  const parser = new Parser();
  const feed = await parser.parseURL(RSS_FEED_URL);
  const items = feed.items.slice(0, MAX_ARTICLES);

  for (const item of items) {
    const text = item.contentSnippet || item.content || item.title || '';
    try {
      const embedRes = await axios.post(`${jinaUrl}/encode`, { data: [text] });
      const embedding = embedRes.data.documents?.[0]?.embedding;

      await Article.findOneAndUpdate(
        { url: item.link },
        {
          title: item.title,
          content: text,
          url: item.link,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          embedding
        },
        { upsert: true }
      );
      console.log(`Indexed article: ${item.title}`);
    } catch (err) {
      console.error(`Failed to index article ${item.title}:`, err.message);
    }
  }

  console.log('Seeding completed.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});