import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const signRefreshToken = (user) =>
  jwt.sign({ id: user._id, tokenVersion: user.tokenVersion }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const randomToken = () => crypto.randomBytes(32).toString('hex');
