# News Chatbot (RAG Pipeline)

This repository implements a simple chatbot over a news corpus, combining retrieval (vector search) with generation (LLM calls) to answer user queries.

## Architecture

- **Ingestion & Embedding**
  - Fetch ~50 articles via RSS feed
  - Embed documents using a self-hosted Jina Flow (free tier)
  - Store embeddings in MongoDB with a vector index
- **Retrieval & Generation**
  - On user query: embed the query, retrieve top-K relevant passages via Jina
  - Assemble context, call Google Gemini API for final answer
  - Persist chat history per session in Redis
- **Backend**
  - Node.js (Express) REST API
  - Endpoints:
    - POST   `/api/chat` → `{ sessionId, query }` → `{ answer }`
    - GET    `/api/chat/:sessionId/history` → chat history array
    - DELETE `/api/chat/:sessionId/history` → clear session history

## Quickstart

1. Clone repo and `cd Backend`
2. Copy `.env.example` to `.env` and populate keys
3. Start services:
   - MongoDB
   - Redis
   - Jina Flow (see below)
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

## Jina Flow (Free & Self-Hosted)

Create a minimal `flow.yml`:
```yaml
!Flow
pods:
  encoder:
    uses: jinahub://SentenceTransformerEncoder
  indexer:
    uses: jinaai/hub/indexers/keyvalue/FAISSIndexer
  rest:
    uses: jinaai/jina:latest
    uses: rest: {}
    needs: [encoder, indexer]
```
Start it:
```bash
jina flow --uses flow.yml --port ${JINA_PORT}
```

## Configuration

All env vars live in `.env.example`:
```dotenv
# Server
PORT=3000
NODE_ENV=development

# Databases
MONGO_URL=mongodb://localhost:27017/mydatabase
REDIS_URL=redis://127.0.0.1:6379

# Jina Flow
JINA_HOST=localhost
JINA_PORT=45678

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# RSS source
RSS_FEED_URL=https://rss.cnn.com/rss/cnn_topstories.rss

# RAG parameters
EMBEDDING_DIM=384
TOP_K=5

# Cache
CHAT_HISTORY_TTL=86400
```

## TTL & Cache Warming

- Chat history TTL is controlled by `CHAT_HISTORY_TTL` (secs).
- To warm caches, re-run `npm run seed` and invoke `/api/chat` with sample queries to populate Redis and Jina indices.

## Next Steps

- Add WebSocket support for live chat
- Scale Jina Flow (sharding & replication)
- Secure API keys via secret management
- Add retry/circuit-breakers around external calls