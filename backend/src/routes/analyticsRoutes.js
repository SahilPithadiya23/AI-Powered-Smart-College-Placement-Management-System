import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  branchPlacements,
  dashboard,
  interviewPrep,
  interviewContext,
  interviewAnswer,
  interviewFollowUp,
  aiChat
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { ROLES } from '../utils/constants.js';

export const analyticsRoutes = express.Router();

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please slow down and try again shortly.'
  }
});

analyticsRoutes.use(protect);

// Dashboard and general analytics
analyticsRoutes.get('/dashboard', dashboard);
analyticsRoutes.get('/branch-placements', branchPlacements);

// Student-only AI Interview Coach endpoints
analyticsRoutes.get('/interview-context', authorize(ROLES.STUDENT), interviewContext);
analyticsRoutes.post('/interview-prep', authorize(ROLES.STUDENT), aiRateLimiter, interviewPrep);
analyticsRoutes.post('/interview-answer', authorize(ROLES.STUDENT), aiRateLimiter, interviewAnswer);
analyticsRoutes.post('/interview-followup', authorize(ROLES.STUDENT), aiRateLimiter, interviewFollowUp);
analyticsRoutes.post('/ai/chat', authorize(ROLES.STUDENT), aiRateLimiter, aiChat);
