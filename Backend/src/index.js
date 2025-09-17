import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import { sessionMiddleware } from "./middlewares/session.js";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import './config/redis.js';
import {redisRateLimiter} from './middlewares/redisRateLimiter.js';
import chatRouter from './routes/chat.js';

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(redisRateLimiter);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
// Health-check endpoint
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'server is running and everything is fine' });
});
app.use('/api/chat', chatRouter);

const PORT = process.env.PORT || "3000";
const MONGO_URL=
  process.env.MONGO_URL ||
  "mongodb://localhost:27017/mydatabase"; /*for docker based port*/

  mongoose
  .connect(MONGO_URL, {})
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) =>
    console.log(`${error} did not 
    connect`)
  );

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;
  res.status(status).json({ success: false, error: message });
});