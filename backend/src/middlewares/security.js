import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const isAllowedDevOrigin = (origin) => {
  if (!origin || env.nodeEnv !== 'development') return false;
  try {
    const url = new URL(origin);
    return ['5173', '5174', '5175'].includes(url.port);
  } catch {
    return false;
  }
};

export const corsOptions = cors({
  origin(origin, callback) {
    const allowedOrigins = new Set([env.clientUrl, ...env.allowedOrigins]);
    if (!origin || allowedOrigins.has(origin) || isAllowedDevOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
});

export const securityMiddleware = [
  helmet(),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
];
