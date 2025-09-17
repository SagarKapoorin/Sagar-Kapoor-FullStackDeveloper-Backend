# Voosh News Chatbot – Frontend

This is the React chat UI for the Voosh News Chatbot. It connects to the backend REST API to manage chat sessions and messages.

## Features
- Display user bot messages of session id
- Type and send new queries
- Live “typing” indicator for bot responses
- Reset button to clear session history

## Tech Stack
- **Framework**: React (18+) with functional components and Hooks
- **Bundler**: Vite for fast development and HMR
- **Language**: TypeScript for type safety
- **Styles**: SCSS with BEM conventions and mixins

## Prerequisites
- Node.js v16+ or higher
- Backend service running and accessible

## Setup & Run

1. Copy environment file and set backend URL:
   ```bash
   cd Frontend
   cp .env .env.local
   # Edit .env.local:
   VITE_API_BASE_URL=http://localhost:3000
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

## Environment Variables
- `VITE_API_BASE_URL` – Base URL of the backend API (must include protocol and port).

## Scripts
- `npm run dev` – Run Vite dev server
- `npm run build` – Build production bundle
- `npm run preview` – Preview production build

## Integration
The front end communicates via these endpoints (handled by `useChatbot` hook):
- `GET  ${VITE_API_BASE_URL}/api/chat/history` – Load chat history
- `POST ${VITE_API_BASE_URL}/api/chat` – Send a new user query
- `DELETE ${VITE_API_BASE_URL}/api/chat/history` – Reset chat session

