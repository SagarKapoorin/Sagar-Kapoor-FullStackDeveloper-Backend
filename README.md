# Voosh News Chatbot (Full-Stack RAG Chatbot)

This monorepo contains a Retrieval-Augmented Generation (RAG) chatbot over a news corpus, powered by:
- Vector Search (MongoDB Atlas Vector Search)
- Embeddings (Jina Cloud or open-source alternatives)
- Generative LLM (Google Gemini)
- Session-Based Chat (Redis for in-memory history, MongoDB for persistence)

## Tech Stack Overview
| Layer     | Technology                                         |
|-----------|----------------------------------------------------|
| Frontend  | React, TypeScript, Vite, SCSS, lucide-react icons |
| Backend   | Node.js, Express, MongoDB, Mongoose, Jina Embeds   |
| LLM API   | Google Gemini                                      |
| Cache     | Redis                                              |
| Embeddings| Jina Cloud                                         |
| Vector DB | MongoDB Atlas Vector Search                        |

## Monorepo Structure

- **Backend/** – Express REST API for RAG ingestion, retrieval, generation, and chat sessions.
  See [Backend/README.md](Backend/README.md) for detailed setup.
- **Frontend/** – React + TypeScript + Vite chat UI with SCSS styling.
  See [Frontend/README.md](Frontend/README.md) for detailed setup.

## Getting Started

1. **Backend Setup:**
   ```bash
   cd Backend
   cp .env.example .env
   # Fill in MONGO_URL, REDIS_URL, JINA_API_KEY, GEMINI_API_KEY, RSS_FEED_URL, etc.
   npm install
   npm run seed       # ingest and embed ~50 articles
   npm run dev        # start server on specified PORT
   ```

2. **Frontend Setup:**
   ```bash
   cd Frontend
   cp .env .env.local
   # Set VITE_API_BASE_URL (e.g. http://localhost:3000)
   npm install
   npm run dev        # open http://localhost:5173
   ```

---
_For detailed configuration, environment variables, vector index setup, cache TTLs, and advanced topics, please see the README files in each subfolders._