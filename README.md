# News Chatbot (RAG Pipeline)

This repository implements a simple chatbot over a news corpus, combining retrieval (vector search) with generation (LLM calls) to answer user queries.

## Architecture

- **Ingestion & Embedding**
  - Fetch ~50 articles via RSS feed
  - Embed documents using Jina Cloud's hosted embeddings API
  - Store embeddings in MongoDB (requires manual vector index creation)
- **Retrieval & Generation**
  - On user query: embed the query, retrieve top-K relevant passages via Jina
  - Assemble context, call Google Gemini API for final answer
  - Persist chat history per session in Redis
- **Backend**
  - Node.js (Express) REST API
  - Endpoints (server manages `sessionId` via HTTP-only cookie):
    - POST    `/api/chat`         → `{ query }` → `{ success: true, answer }`
    - GET     `/api/chat/history` → `{ success: true, history }`           (fast Redis cache, falls back to Mongo)
    - DELETE  `/api/chat/history` → `{ success: true }`                   (clears both Redis & Mongo history)

## Quickstart

1. Clone repo and `cd Backend`
2. Copy `.env.example` to `.env` and populate keys
3. Start services:
   - MongoDB
   - Redis
   
4. Install dependencies and seed articles (run once to bootstrap your corpus):
   ```bash
   npm install
   npm run seed
   ```
   - Re-running this command will *upsert* articles by their URL: existing items are updated, new ones are added, but articles no longer present in the RSS feed will remain in the database unless you clear the collection manually.
5. Launch backend:
   ```bash
   npm run dev
   ```

## Jina Cloud Embeddings API (Hosted)

No local Jina Flow is required for embeddings. Sign up at https://cloud.jina.ai/, obtain a free API key, and add `JINA_API_KEY` to your `.env`.

## Configuration

All env vars live in `.env.example`:
```dotenv
# Server
PORT=3000
NODE_ENV=development

# Databases
MONGO_URL=mongodb://localhost:27017/mydatabase
REDIS_URL=redis://127.0.0.1:6379

# Jina Embeddings API
JINA_API_KEY=your_jina_api_key
# (Optional) override default embedding model on Jina Cloud
JINA_MODEL=jina-embeddings-v3

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# RSS source
RSS_FEED_URL=https://rss.cnn.com/rss/cnn_topstories.rss

# RAG parameters
TOP_K=5

# Cache
CHAT_HISTORY_TTL=86400  
```

## Manual Vector Index Creation

After seeding your articles, you must create the MongoDB vector index by hand. In your mongo shell execute:
```js
use <yourDatabaseName>;                     
db.articles.createSearchIndex({
  name: "embedding_vector_idx",
  type: "vectorSearch",
  definition: {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: 1024,
        similarity: "cosine"
      }
    ]
  }
});
// Verify:
verfiy on mongodb Atlas search section once
```
This ensures that the `$vectorSearch` queries in `chatService.js` can run correctly.

## TTL & Cache Warming

- Chat history TTL is controlled by `CHAT_HISTORY_TTL` (secs).
- To warm caches, re-run `npm run seed` and invoke `/api/chat` with sample queries to populate Redis and Jina indices.
  
## Input Validation & Error Handling

- All API endpoints validate their inputs (sessionId cookie and request body) and return `400 Bad Request` for malformed requests.
- Service logic wraps external calls and database operations, returning:
  - `502 Bad Gateway` for upstream (Jina/Gemini) failures,
  - `500 Internal Server Error` for unexpected exceptions.

## Resilience & Performance

- **Circuit Breaker**: Gemini API calls are protected by a circuit breaker (10s timeout, opens after >50% failures, 30s reset) to avoid cascading failures.
- **Async Persistence**: Chat messages are batched and written to Redis and MongoDB in a fire-and-forget fashion to minimize latency for user responses.

